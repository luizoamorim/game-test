import { Item } from "../../../entity/Item";
import { TransferItemBody } from "../../../entity/TransferItemBody";
import { IItemRepository } from "../../IItemRepository";

export class ItemRepositoryMem implements IItemRepository {
    private items: Item[] = []; // In-memory storage for items

    constructor() {}
    findByIds(itemsId: number[]): Promise<Item[]> {
        throw new Error("Method not implemented.");
    }

    async findManyByUserId(userId: number, itemsId: number[]): Promise<number> {
        return this.items.filter(
            (item) => item.ownerId === userId && itemsId.includes(item.id),
        ).length;
    }

    async transferItems(transferItemBody: TransferItemBody): Promise<boolean> {
        const { sourceUserId, targetUserId, itemsId } = transferItemBody;
        let transferred = false;

        this.items = this.items.map((item) => {
            if (item.ownerId === sourceUserId && itemsId.includes(item.id)) {
                item.ownerId = targetUserId;
                transferred = true;
            }
            return item;
        });

        return transferred;
    }

    async findByUserId(userId: number): Promise<Array<Item>> {
        return this.items.filter((item) => item.ownerId === userId);
    }

    async findById(itemId: number): Promise<Item | undefined> {
        return this.items.find((item) => item.id === itemId);
    }

    async save(item: Item): Promise<Item> {
        const index = this.items.findIndex((it) => it.id === item.id);
        if (index !== -1) {
            this.items[index] = item;
        } else {
            this.items.push(item);
        }
        return item;
    }

    saveMany(items: Item[]): Promise<Item[]> {
        this.items = [...this.items, ...items];
        return Promise.resolve(items);
    }

    async discardItem(itemId: number): Promise<void> {
        this.items = this.items.filter((item) => item.id !== itemId);
    }

    async delete(itemId: number): Promise<boolean> {
        const initialLength = this.items.length;
        this.items = this.items.filter((item) => item.id !== itemId);
        return this.items.length < initialLength;
    }

    async deleteMany(itemsId: number[]): Promise<number> {
        const initialLength = this.items.length;
        this.items = this.items.filter((item) => !itemsId.includes(item.id));
        return initialLength - this.items.length;
    }
}
