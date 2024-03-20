import { FastifyInstance } from "fastify";
import { logger } from "../logs";
import { plainToInstance } from "class-transformer";
import ICharacterRepository from "../repository/ICharacterRepository";
import CharacterRepositoryPg from "../repository/implementations/Postgres/CharacterRepositoryPg";
import { CharacterController } from "../controller/CharacterController";
import { EquipItemBody } from "../entity/EquipItemBody";
import { IItemRepository } from "../repository/IItemRepository";
import { ItemRepositoryPg } from "../repository/implementations/Postgres/ItemRepositoryPg";
import { CharacterDiscardItemsBody } from "../entity/CharacterDiscardItemsBody";

export default async function characterAPI(fastify: FastifyInstance) {
    let characterRepository: ICharacterRepository;
    let itemRepository: IItemRepository;

    if (process.env.NODE_ENV === "test") {
        console.log(
            "\x1b[33m",
            "ALERT: Make sure to use the test database for the tests.",
        );
    }

    characterRepository = new CharacterRepositoryPg();
    itemRepository = new ItemRepositoryPg();

    const characterController = new CharacterController(
        characterRepository,
        itemRepository,
    );

    fastify.post("/equip-items", async (request, reply) => {
        try {
            const equipItemBody = plainToInstance(EquipItemBody, request.body);

            await equipItemBody.validate();

            const result = await characterController.equip(equipItemBody);

            if (!result) {
                logger.error(
                    "Internal server error on transfer items return null result",
                );
                return reply
                    .status(500)
                    .send({ message: "Internal server error" });
            }
            logger.info(
                "Success on equip the character %d",
                equipItemBody.characterId,
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

    fastify.post("/discard-items", async (request, reply) => {
        try {
            const characterDiscardItems = plainToInstance(
                CharacterDiscardItemsBody,
                request.body,
            );

            await characterDiscardItems.validate();

            const result = await characterController.discardItems(
                characterDiscardItems,
            );

            if (!result) {
                logger.error(
                    "Internal server error on transfer items return null result",
                );
                return reply
                    .status(500)
                    .send({ message: "Internal server error" });
            }
            logger.info(
                "Success on discard the items of the character %d",
                characterDiscardItems.characterId,
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
