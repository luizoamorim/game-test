import { TransferItemBody } from "../entity/TransferItemBody";
import { logger } from "../logs";
import { IItemRepository } from "../repository/IItemRepository";
import UserRepositoryPg from "../repository/implementations/Postgres/UserRepositoryPg";

export class ItemService {
    private itemRepository: IItemRepository;

    constructor(itemRepository: IItemRepository) {
        this.itemRepository = itemRepository;
    }

    async transferItems(transferItemBody: TransferItemBody): Promise<boolean> {
        // I need to check if the users exists in the database
        // and if the items belong to the user
        // and if the target user exists
        const userRepository = new UserRepositoryPg();
        const sourceUser = await userRepository.findById(
            transferItemBody.sourceUserId,
        );
        const targetUser = await userRepository.findById(
            transferItemBody.targetUserId,
        );

        if (!sourceUser) {
            logger.error(
                "Source user %d does not exist",
                transferItemBody.sourceUserId,
            );
            throw new Error("Source user does not exist");
        }

        if (!targetUser) {
            logger.error(
                "Target user %d does not exist",
                transferItemBody.targetUserId,
            );
            throw new Error("Target user does not exist");
        }

        const ownedItems = await this.itemRepository.findManyByUserId(
            transferItemBody.sourceUserId,
            transferItemBody.itemsId,
        );

        if (ownedItems !== transferItemBody.itemsId.length) {
            logger.error(
                "Some items do not belong to the user %d",
                transferItemBody.sourceUserId,
            );
            throw new Error("Some items do not belong to the user");
        }

        const items = await this.itemRepository.findByIds(
            transferItemBody.itemsId,
        );

        // I need to check if the items not belongs to a character
        const itemsNotBelongsToCharacter = items.filter(
            (item) => item.characterId === null,
        );

        await this.itemRepository.transferItems(transferItemBody);

        return true;
    }
}
