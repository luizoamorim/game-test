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
import { DiscardItemsBody } from "../../src/entity/DiscardItemsBody";

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

describe("E2E: Discard User's Inventory Items", () => {
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

    // REQ01 1. The user must exists
    it("REQ01. should return an error if the user does not exist", async () => {
        const discardItemsBody = {
            userId: 99999,
            itemsId: [itemsId[0]], // Assuming itemsId is an array of existing item IDs
        };

        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/discard-items",
            payload: discardItemsBody,
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain("User does not exist");
    });

    // REQ02 2. The item must belong to the user
    it("REQ02. should return an error if the item does not belong to the user", async () => {
        const discardItemsBody = {
            userId: testUserIds[0],
            itemsId: [99999], // Non-existing item ID
        };

        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/discard-items",
            payload: discardItemsBody,
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain(
            "Some items do not belong to the user",
        );
    });

    // REQ03 3. The item must not belong to any character
    it("REQ03. should return an error if the item belongs to a character", async () => {
        // Setup where itemsId[0] belongs to characterIds[0]
        await itemRepository.updateCharacterId(itemsId[0], characterIds[0]);

        const discardItemsBody = {
            userId: testUserIds[0],
            itemsId: [itemsId[0]],
        };

        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/discard-items",
            payload: discardItemsBody,
        });

        expect(response.statusCode).toBe(400);
        expect(response.payload).toContain("Some items belong to a character");
    });

    // REQ04 4. The item must be discarded
    it("SUCCESS: should successfully discard items from the user's inventory", async () => {
        const discardItemsBody = {
            userId: testUserIds[0],
            itemsId: [itemsId[0]],
        };

        // discard character item
        await characterRepository.discard(characterIds[0], itemsId[0]);

        let item = await itemRepository.findById(itemsId[0]);
        expect(item).toBeDefined();
        expect(item!.ownerId).toBe(testUserIds[0]);

        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/discard-items",
            payload: discardItemsBody,
        });

        //expect(response.statusCode).toBe(200);
        expect(response.payload).toContain("Items discarded successfully");

        // Find the item and check if it no longer belongs more to the user
        item = await itemRepository.findById(itemsId[0]);
        expect(item).toBeDefined();
        expect(item!.ownerId).toBeNull();
    });
});
