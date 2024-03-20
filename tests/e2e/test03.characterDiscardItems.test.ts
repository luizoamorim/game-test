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

describe("E2E: Discard Character Items", () => {
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
            userId: user2.id,
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

    it("REQ01. should return an error if the character does not exist", async () => {
        const characterDiscardItems = {
            userId: testUserIds[0],
            characterId: 9999, // Non-existing character ID
            itemsId: [itemsId[0]], // Assuming itemsId is an array of existing item IDs
        };

        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/discard-items",
            payload: characterDiscardItems,
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain("Character not found");
    });

    it("REQ02. should return an error if the character does not belong to the user", async () => {
        // Assuming characterIds[1] is owned by testUserIds[1] and we're using testUserIds[0]
        const characterDiscardItems = {
            userId: testUserIds[0],
            characterId: characterIds[1],
            itemsId: [itemsId[0]],
        };

        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/discard-items",
            payload: characterDiscardItems,
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain(
            "Character does not belong to the user",
        );
    });

    it("REQ03. should return an error if some items do not belong to the user", async () => {
        // Assuming itemsId[0] is owned by testUserIds[0]
        const characterDiscardItems = {
            userId: testUserIds[1], // User ID of the owner
            characterId: characterIds[1], // The character belongs to the user
            itemsId: [itemsId[0]], // But this item does not belong to the user
        };

        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/discard-items",
            payload: characterDiscardItems,
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain(
            "Some items do not belong to the user",
        );
    });

    it("REQ04. should return an error if some items do not belong to the character", async () => {
        // Setup where itemsId[0] does not belong to characterIds[0]
        const characterDiscardItems = {
            userId: testUserIds[0],
            characterId: characterIds[0],
            itemsId: [itemsId[0]],
        };

        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/discard-items",
            payload: characterDiscardItems,
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain(
            "Some items do not belong to the character",
        );
    });

    it("SUCCESS: should successfully discard items from a character", async () => {
        // Setup where characterIds[0] owns itemsId[0]
        const characterDiscardItems = {
            userId: testUserIds[0],
            characterId: characterIds[0],
            itemsId: [itemsId[0]],
        };

        // update character
        await itemRepository.updateCharacterId(itemsId[0], characterIds[0]);

        const response = await fastify.inject({
            method: "POST",
            url: "/api/character/discard-items",
            payload: characterDiscardItems,
        });

        //expect(response.statusCode).toBe(200);
        expect(response.payload).toContain("Items discarded successfully");

        // Find the item and check if it no longer belongs to a character
        const item = await itemRepository.findById(itemsId[0]);
        expect(item).toBeDefined();
        console.log("item", item);
        expect(item!.characterId).toBeNull();
    });
});
