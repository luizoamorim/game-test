import Result from "../../types/Result";
import { IItemRepository } from "../repository/IItemRepository";
import { ItemService } from "../service/ItemService";

export class ItemController {
    private itemService: ItemService;

    constructor(itemRepository: IItemRepository) {
        this.itemService = new ItemService(itemRepository);
    }

    async transferItems(transferItemBody: any): Promise<Result | null> {
        const result = await this.itemService.transferItems(transferItemBody);
        if (!result) {
            return null;
        }
        return {
            httpStatusCode: 200,
            message: "Items transferred successfully",
            data: null,
        };
    }

    async discardMany(
        discardItemsBody: DiscardItemsBody,
    ): Promise<Result | null> {
        const result = await this.itemService.discardMany(discardItemsBody);
        if (!result) {
            return null;
        }
        return {
            httpStatusCode: 200,
            message: "Items discarded successfully",
            data: null,
        };
    }
}
