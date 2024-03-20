import { FastifyInstance } from "fastify";
import createServer from "../../src/server";
import { describe, beforeAll, afterAll, it, expect } from "vitest";
import { ItemController } from "../../src/controller/ItemController";
import { ItemRepositoryPg } from "../../src/repository/implementations/Postgres/ItemRepositoryPg";
import UserRepositoryPg from "../../src/repository/implementations/Postgres/UserRepositoryPg";
import { User } from "../../src/entity/User";

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

// Mock request body for transfer
const transferRequestBody = {
    sourceUserId: 1,
    targetUserId: 2,
    itemsId: [1, 2],
};

describe("E2E: Item Transfer", () => {
    let fastify: FastifyInstance;
    let itemRepository: ItemRepositoryPg;
    let itemController: ItemController;
    let userRepository: UserRepositoryPg;
    let testUserIds: any = [];

    beforeAll(async () => {
        // Initialize your Fastify application
        fastify = createServer();
        itemRepository = new ItemRepositoryPg();
        itemController = new ItemController(itemRepository);
        userRepository = new UserRepositoryPg();

        // Mock the repository in your Fastify instance
        fastify.decorate("itemRepository", itemRepository);

        // Create test users
        const user1 = await userRepository.save({
            email: "testuser1@example.com",
        } as User); // Adjust based on actual User model
        console.log("user1", user1);
        transferRequestBody.sourceUserId = user1.id;
        itemsToSave.forEach((item: any) => {
            item.ownerId = user1.id;
        });

        const user2 = await userRepository.save({
            email: "testuser2@example.com",
        } as User);
        testUserIds.push(user1.id, user2.id);
        transferRequestBody.targetUserId = user2.id;

        // Initialize or save mock items if needed here...
        const result = await itemRepository.saveMany(itemsToSave);
    });

    afterAll(async () => {
        // Clean up and close Fastify server
        const itemsFound = await itemRepository.findByUserId(testUserIds[1]);
        await itemRepository.deleteMany(itemsFound.map((item: any) => item.id));
        await Promise.all(
            testUserIds.map((userId: any) => userRepository.delete(userId)),
        );
        await fastify.close();
    });

    it("Items should be transferred successfully", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        let itemsBuUserId = await itemRepository.findManyByUserId(
            testUserIds[0],
            [1, 2],
        );
        expect(itemsBuUserId).toBe(2);
        const response = await fastify.inject({
            method: "POST",
            url: "/api/transfer-items",
            payload: transferRequestBody,
        });
        itemsBuUserId = await itemRepository.findManyByUserId(
            testUserIds[1],
            [1, 2],
        );
        expect(itemsBuUserId).toBe(2);
        expect(response.payload).toEqual(
            '{"message":"Items transferred successfully","data":null}',
        );
        expect(response.statusCode).toBe(200);
    });

    it("Items should not be transferred if source user does not own them", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/transfer-items",
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

    it("Items should not be transferred if source user does not exist", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/transfer-items",
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

    it("Items should not be transferred if target user does not exist", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/transfer-items",
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

    it("Should reutrn 400 if the itemsId in the request body is invalid", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/transfer-items",
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

    it("Should reutrn 400 if the sourceUserId in the request body is invalid", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/transfer-items",
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

    it("Should reutrn 400 if the targetUserId in the request body is invalid", async () => {
        // Assuming you have an endpoint set up to handle this in your Fastify app
        const response = await fastify.inject({
            method: "POST",
            url: "/api/transfer-items",
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
