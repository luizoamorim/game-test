import { FastifyInstance } from "fastify";
import createServer from "../../src/server";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { ItemController } from "../../src/controller/ItemController";
import { ItemRepositoryPg } from "../../src/repository/implementations/Postgres/ItemRepositoryPg";
import UserRepositoryPg from "../../src/repository/implementations/Postgres/UserRepositoryPg";
import { User } from "../../src/entity/User";
import CharacterRepositoryPg from "../../src/repository/implementations/Postgres/CharacterRepositoryPg";
import ICharacterRepository from "../../src/repository/ICharacterRepository";
import IUserRepository from "../../src/repository/IUserRepository";
import { IItemRepository } from "../../src/repository/IItemRepository";

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

// Mock request body for transfer
const transferRequestBody = {
    sourceUserId: 1,
    targetUserId: 2,
    itemsId: [1, 2],
};

describe("E2E: Item Transfer", () => {
    let fastify: FastifyInstance;
    let itemRepository: IItemRepository;
    let itemController: ItemController;
    let userRepository: IUserRepository;
    let characterRepository: ICharacterRepository;
    let testUserIds: any = [];
    let itemsId: any = [];
    let characterId: number;

    beforeAll(async () => {
        // Initialize your Fastify application
        fastify = createServer();
        itemRepository = new ItemRepositoryPg();
        itemController = new ItemController(itemRepository);
        userRepository = new UserRepositoryPg();
        characterRepository = new CharacterRepositoryPg();

        // Mock the repository in your Fastify instance
        fastify.decorate("itemRepository", itemRepository);

        // Create test users
        const user1 = await userRepository.save({
            email: "testuser1@example.com",
        } as User); // Adjust based on actual User model
        transferRequestBody.sourceUserId = user1.id;
        itemsToSave.forEach((item: any) => {
            item.ownerId = user1.id;
        });

        const user2 = await userRepository.save({
            email: "testuser2@example.com",
        } as User);
        testUserIds.push(user1.id, user2.id);
        transferRequestBody.targetUserId = user2.id;

        const characterCreated = await characterRepository.save({
            ...mockCharacterToSave,
            userId: user1.id,
        } as any);
        characterId = characterCreated.id;

        // Initialize or save mock items if needed here...
        await itemRepository.saveMany(itemsToSave);
        const itemsFound = await itemRepository.findByUserId(user1.id);
        itemsId = itemsFound.map((item: any) => item.id);
    });

    afterAll(async () => {
        // Clean up and close Fastify server
        const itemsFound = await itemRepository.findByUserId(testUserIds[1]);
        await characterRepository.delete(characterId);
        await itemRepository.deleteMany(itemsFound.map((item: any) => item.id));
        await Promise.all(
            testUserIds.map((userId: any) => userRepository.delete(userId)),
        );
        await fastify.close();
    });

    it("SUCCESS: Items should be transferred successfully", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        let itemsByUserId = await itemRepository.findManyByUserId(
            testUserIds[0],
            [itemsId[0], itemsId[1]],
        );
        expect(itemsByUserId).toBe(2);
        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/transfer-items",
            payload: transferRequestBody,
        });
        itemsByUserId = await itemRepository.findManyByUserId(testUserIds[1], [
            itemsId[0],
            itemsId[1],
        ]);
        expect(itemsByUserId).toBe(2);
        expect(response.payload).toEqual(
            '{"message":"Items transferred successfully","data":null}',
        );
        expect(response.statusCode).toBe(200);
    });

    it("REQ01. Items should not be transferred if source user does not exist", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/transfer-items",
            payload: {
                ...transferRequestBody,
                sourceUserId: testUserIds[1] + 1,
            },
        });

        expect(response.payload).toEqual(
            '{"message":"Source user does not exist"}',
        );
        expect(response.statusCode).toBe(400);
    });

    it("REQ02. Items should not be transferred if target user does not exist", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/transfer-items",
            payload: {
                ...transferRequestBody,
                targetUserId: testUserIds[1] + 1,
            },
        });

        expect(response.payload).toEqual(
            '{"message":"Target user does not exist"}',
        );
        expect(response.statusCode).toBe(400);
    });

    it("REQ03. Items should not be transferred if source user does not own them", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/transfer-items",
            payload: {
                ...transferRequestBody,
                sourceUserId: testUserIds[0],
            },
        });

        expect(response.payload).toEqual(
            '{"message":"Some items do not belong to the user"}',
        );
        expect(response.statusCode).toBe(400);
    });

    it("REQ04. Items should not be transferred if some items belong to a character", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        let itemsByUserId = await itemRepository.findManyByUserId(
            testUserIds[1],
            [itemsId[0], itemsId[1]],
        );
        expect(itemsByUserId).toBe(2);

        // update character
        await itemRepository.updateCharacterId(itemsId[0], characterId);

        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/transfer-items",
            payload: {
                ...transferRequestBody,
                sourceUserId: testUserIds[1],
            },
        });

        expect(response.payload).toEqual(
            '{"message":"Some items belong to a character"}',
        );
        expect(response.statusCode).toBe(400);
    });

    it("ROUTE_VALIDATION_01: Should reutrn 400 if the itemsId in the request body is invalid", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/transfer-items",
            payload: {
                ...transferRequestBody,
                itemsId: "invalid",
            },
        });

        expect(response.payload).toEqual(
            '{"message":"Each Item ID must be an integer."}',
        );
        expect(response.statusCode).toBe(400);
    });

    it("ROUTE_VALIDATION_02: Should reutrn 400 if the sourceUserId in the request body is invalid", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/transfer-items",
            payload: {
                ...transferRequestBody,
                sourceUserId: "invalid",
            },
        });

        expect(response.payload).toEqual(
            '{"message":"Source User ID must be an integer."}',
        );
        expect(response.statusCode).toBe(400);
    });

    it("ROUTE_VALIDATION_03: Should reutrn 400 if the targetUserId in the request body is invalid", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/item/transfer-items",
            payload: {
                ...transferRequestBody,
                targetUserId: "invalid",
            },
        });

        expect(response.payload).toEqual(
            '{"message":"Target User ID must be an integer."}',
        );
        expect(response.statusCode).toBe(400);
    });
});
