import { Item } from "../entity/Item";
import { TransferItemBody } from "../entity/TransferItemBody";

export interface IItemRepository {
    save(item: Item): Promise<Item>;

    saveMany(items: Array<Item>): Promise<number>;

    findById(itemId: number): Promise<Item | undefined>;

    findByIds(itemsId: Array<number>): Promise<Array<Item>>;

    findByUserId(userId: number): Promise<Array<Item>>;

    findManyByUserId(userId: number, itemsId: Array<number>): Promise<number>;

    transferItems(transferItemBody: TransferItemBody): Promise<boolean>;

    updateCharacterId(itemId: number, characterId: number): Promise<Item>;

    updateManyByCharacterId(
        itemsId: Array<number>,
        characterId: number,
    ): Promise<number>;

    discardItem(itemId: number): Promise<void>;

    delete(itemId: number): Promise<boolean>;

    deleteMany(itemsId: Array<number>): Promise<number>;
}
