import { FastifyInstance } from "fastify";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { IItemRepository } from "../../src/repository/IItemRepository";
import { ItemController } from "../../src/controller/ItemController";
import IUserRepository from "../../src/repository/IUserRepository";
import ICharacterRepository from "../../src/repository/ICharacterRepository";
import { User } from "../../src/entity/User";
import CharacterRepositoryPg from "../../src/repository/implementations/Postgres/CharacterRepositoryPg";
import UserRepositoryPg from "../../src/repository/implementations/Postgres/UserRepositoryPg";
import { ItemRepositoryPg } from "../../src/repository/implementations/Postgres/ItemRepositoryPg";
import createServer from "../../src/server";

// Mock items to be saved and then transferred
const itemsToSave: any = [
    {
        id: 1,
        name: "Item 1",
        typeId: 1,
        ownerId: 1,
    },
    {
        id: 2,
        name: "Item 2",
        typeId: 2,
        ownerId: 1,
    },
];

const mockCharacterToSave = {
    name: "Test Character",
    userId: 1,
    level: 1,
    health: 100,
};

describe("E2E: Equip Character", () => {
    let fastify: FastifyInstance;
    let itemRepository: IItemRepository;
    let itemController: ItemController;
    let userRepository: IUserRepository;
    let characterRepository: ICharacterRepository;
    let testUserIds: any = [];
    let characterIds: number[] = [];
    let itemsId: any = [];

    beforeAll(async () => {
        // Initialize your Fastify application
        fastify = createServer();
        itemRepository = new ItemRepositoryPg();
        itemController = new ItemController(itemRepository);
        userRepository = new UserRepositoryPg();
        characterRepository = new CharacterRepositoryPg();
        //

        // Mock the repository in your Fastify instance
        fastify.decorate("itemRepository", itemRepository);
        //

        // Create test users
        const user1 = await userRepository.save({
            email: "testuserCharacter1@example.com",
        } as User);

        itemsToSave.forEach((item: any) => {
            item.ownerId = user1.id;
        });

        const user2 = await userRepository.save({
            email: "testuserCharacter2@example.com",
        } as User);
        testUserIds.push(user1.id, user2.id);
        //

        const characterCreated = await characterRepository.save({
            ...mockCharacterToSave,
            userId: user1.id,
        } as any);
        characterIds.push(characterCreated.id);

        const characterCreated2 = await characterRepository.save({
            ...mockCharacterToSave,
            userId: user1.id,
        } as any);
        characterIds.push(characterCreated2.id);

        await itemRepository.saveMany(itemsToSave);
        const itemsFound = await itemRepository.findByUserId(user1.id);
        itemsId = itemsFound.map((item: any) => item.id);
    });

    afterAll(async () => {
        // Clean up and close Fastify server
        const itemsFound = await itemRepository.findByUserId(testUserIds[0]);
        await characterRepository.delete(characterIds[0]);
        await characterRepository.delete(characterIds[1]);
        await itemRepository.deleteMany(itemsFound.map((item: any) => item.id));
        await Promise.all(
            testUserIds.map((userId: any) => userRepository.delete(userId)),
        );
        await fastify.close();
    });

    it("SUCCESS: should successfully equip an item to a character", async () => {
        // Setup
        const equipItemBody = {
            userId: testUserIds[0], // User ID of the owner
            characterId: characterIds[0],
            itemsId: [1], // ID of the item to equip
        };

        // Act
        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/equip-items", // Assuming this is the route for the equip functionality
            payload: equipItemBody,
        });

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.payload).toEqual(
            '{"message":"Caracter equiped successfully","data":null}',
        );

        // Clean up
        await characterRepository.discardMany(
            equipItemBody.characterId,
            equipItemBody.itemsId,
        );
    });

    it("REQ01. should return an error if the character does not exists", async () => {
        // Setup
        const equipItemBody = {
            userId: testUserIds[0],
            characterId: 9999, // Non-existing character ID
            itemsId: [itemsToSave[0].id],
        };

        // Act
        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/equip-items",
            payload: equipItemBody,
        });

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain("Character not found");
    });

    it("REQ02. should return an error if the character does not belong to the user", async () => {
        // for it I need to create a new character id for the user2
        const characterCreated = await characterRepository.save({
            ...mockCharacterToSave,
            userId: testUserIds[1],
        } as any);

        // Setup
        const equipItemBody = {
            userId: testUserIds[0],
            characterId: characterCreated.id,
            itemsId: [itemsToSave[0].id],
        };

        // Act
        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/equip-items",
            payload: equipItemBody,
        });

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain(
            "Character does not belong to the user",
        );

        // Clean up
        await characterRepository.delete(characterCreated.id);
    });

    it("REQ03. should return an error if the item does not belong to the user", async () => {
        // Setup
        const equipItemBody = {
            userId: testUserIds[1], // Different user ID than the item owner's
            characterId: characterIds[0],
            itemsId: [itemsToSave[0].id],
        };

        // Act
        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/equip-items",
            payload: equipItemBody,
        });

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain(
            '{"message":"Character does not belong to the user"}',
        );
    });

    it("REQ04. should return an error if the item already belongs to another character", async () => {
        // First, artificially assign an item to a different character
        await itemRepository.updateCharacterId(
            itemsToSave[0].id,
            characterIds[1],
        );

        // Setup
        const equipItemBody = {
            userId: testUserIds[0],
            characterId: characterIds[0],
            itemsId: [itemsToSave[0].id],
        };

        // Act
        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/equip-items",
            payload: equipItemBody,
        });

        // Assert
        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain("Some items belong to a character");
    });
});
