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
        throw new Error("Method not implemented.");
    }

    async saveMany(items: Item[]): Promise<Item[]> {
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

    async discardItem(itemId: number): Promise<void> {
        throw new Error("Method not implemented.");
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
