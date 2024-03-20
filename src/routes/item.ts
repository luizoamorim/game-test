import { FastifyInstance } from "fastify";
import { logger } from "../logs";
import { plainToInstance } from "class-transformer";
import { TransferItemBody } from "../entity/TransferItemBody";
import { IItemRepository } from "../repository/IItemRepository";
import { ItemRepositoryPg } from "../repository/implementations/Postgres/ItemRepositoryPg";
import { ItemController } from "../controller/ItemController";

export default async function itemAPI(fastify: FastifyInstance) {
    let itemRepository: IItemRepository;

    if (process.env.NODE_ENV === "test") {
        itemRepository = new ItemRepositoryPg();
        console.log(
            "\x1b[33m",
            "ALERT: Make sure to use the test database for the tests. Setup it in the .env.test file",
        );
    } else {
        itemRepository = new ItemRepositoryPg();
    }

    const itemController = new ItemController(itemRepository);

    fastify.post("/transfer-items", async (request, reply) => {
        try {
            const transferItemBody = plainToInstance(
                TransferItemBody,
                request.body,
            );

            await transferItemBody.validate();

            const result = await itemController.transferItems(transferItemBody);

            if (!result) {
                logger.error(
                    "Internal server error on transfer items return null result",
                );
                return reply
                    .status(500)
                    .send({ message: "Internal server error" });
            }
            logger.info(
                "Success on transfer items from user %d to %d",
                transferItemBody.sourceUserId,
                transferItemBody.targetUserId,
            );
            return await reply.status(result.httpStatusCode).send({
                message: result.message,
                data: result.data,
            });
        } catch (errors) {
            if (Array.isArray(errors)) {
                // Extract validation error messages
                const validationErrors = errors.map((error) => {
                    return {
                        field: error.property,
                        message: Object.values(error.constraints)[0], // Gets the first constraint message
                    };
                });

                logger.error(validationErrors, "Validation errors: ");

                return reply
                    .status(400)
                    .send({ message: validationErrors[0].message });
            }

            if (errors instanceof Error) {
                logger.error(errors, "Errors");
                return reply.status(400).send({ message: errors.message });
            }

            // Handle other types of errors
            logger.error(errors, "ERROR: ");
            return reply.status(500).send({ message: "Internal server error" });
        }
    });
}
