import { PrismaClient } from "@prisma/client";
import { Item } from "../../../entity/Item";
import { TransferItemBody } from "../../../entity/TransferItemBody";
import { IItemRepository } from "../../IItemRepository";
import { logger } from "../../../logs";

export class ItemRepositoryPg implements IItemRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async save(item: Item): Promise<Item> {
        try {
            const itemSaved = await this.prisma.item.create({
                data: item as any,
            });
            return itemSaved as any;
        } catch (error) {
            logger.error("Error saving item on the repository", error);
            throw new Error("Error saving item on the repository");
        }
    }

    async saveMany(items: Item[]): Promise<number> {
        const itemsSaved = await this.prisma.item.createMany({
            data: items as any[],
            skipDuplicates: true,
        });
        return itemsSaved as any;
    }
    async findById(itemId: number): Promise<Item> {
        try {
            const item = await this.prisma.item.findUnique({
                where: {
                    id: itemId,
                },
            });
            return item as any;
        } catch (error) {
            logger.error("Error finding item by id in the repository", error);
            throw new Error("Error finding item by id in the repository");
        }
    }

    async findByIds(itemsId: number[]): Promise<Item[]> {
        try {
            const items = await this.prisma.item.findMany({
                where: {
                    id: {
                        in: itemsId,
                    },
                },
            });
            return items as any;
        } catch (error) {
            logger.error("Error finding items by id in the repository", error);
            throw new Error("Error finding items by id in the repository");
        }
    }

    async findManyByUserId(userId: number, itemsId: number[]): Promise<number> {
        try {
            const ownedItems = await this.prisma.item.count({
                where: {
                    id: {
                        in: itemsId,
                    },
                    ownerId: userId,
                },
            });
            return ownedItems;
        } catch (error) {
            logger.error(
                "Error finding items by userId in the repository",
                error,
            );
            throw new Error("Error finding items by userId in the repository");
        }
    }

    async findByUserId(userId: number): Promise<Array<Item>> {
        try {
            const items = await this.prisma.item.findMany({
                where: {
                    ownerId: userId,
                },
            });
            return items as any;
        } catch (error) {
            logger.error(
                "Error finding items by userId in the repository",
                error,
            );
            throw new Error("Error finding items by userId in the repository");
        }
    }

    async transferItems(transferItemBody: TransferItemBody): Promise<boolean> {
        try {
            await this.prisma.item.updateMany({
                where: {
                    id: {
                        in: transferItemBody.itemsId,
                    },
                    ownerId: transferItemBody.sourceUserId, // Additional safeguard
                },
                data: {
                    ownerId: transferItemBody.targetUserId,
                },
            });
            return true;
        } catch (error) {
            logger.error("Error transferring items on the repository", error);
            throw new Error("Error transferring items on the repository");
        }
    }

    async updateCharacterId(
        itemId: number,
        characterId: number,
    ): Promise<Item> {
        try {
            const item = await this.prisma.item.update({
                where: {
                    id: itemId,
                },
                data: {
                    characterId: characterId,
                },
            });
            return item as any;
        } catch (error) {
            logger.error("Error updating item on the repository", error);
            throw new Error("Error updating item on the repository");
        }
    }

    async updateManyByCharacterId(
        itemsId: number[],
        characterId: number,
    ): Promise<number> {
        console.log("itemsId no REPO: ", itemsId);
        console.log("characterId no REPO: ", characterId);
        try {
            const result = await this.prisma.item.updateMany({
                where: {
                    id: {
                        in: itemsId,
                    },
                },
                data: {
                    characterId: parseInt(characterId.toString()),
                },
            });
            return result.count;
        } catch (error) {
            console.log("error no REPO: ", error);
            logger.error("Error updating items on the repository", error);
            throw new Error("Error updating items on the repository");
        }
    }

    async characterDiscardItem(itemId: number): Promise<Item> {
        console.log("itemId no REPO: ", itemId);
        try {
            const itemUpdated = await this.prisma.item.update({
                where: {
                    id: itemId,
                },
                data: {
                    characterId: null,
                },
            });
            console.log("itemUpdated no REPO: ", itemUpdated);
            return itemUpdated as any;
        } catch (error) {
            logger.error("Error discarding item on the repository", error);
            throw new Error("Error discarding item on the repository");
        }
    }

    async discard(itemId: number): Promise<Item> {
        try {
            const itemUpdated = await this.prisma.item.update({
                where: {
                    id: itemId,
                },
                data: {
                    ownerId: null,
                },
            });
            return itemUpdated as any;
        } catch (error) {
            logger.error("Error discarding items on the repository", error);
            throw new Error("Error discarding items on the repository");
        }
    }

    async delete(itemId: number): Promise<boolean> {
        try {
            await this.prisma.item.delete({
                where: {
                    id: itemId,
                },
            });
            return true;
        } catch (error) {
            logger.error("Error deleting item on the repository", error);
            throw new Error("Error deleting item on the repository");
        }
    }

    async deleteMany(itemsId: number[]): Promise<number> {
        try {
            const result = await this.prisma.item.deleteMany({
                where: {
                    id: {
                        in: itemsId,
                    },
                },
            });
            return result.count;
        } catch (error) {
            logger.error("Error deleting items on the repository", error);
            throw new Error("Error deleting items on the repository");
        }
    }
}
