import { TransferItemBody } from "../entity/TransferItemBody";
import { logger } from "../logs";
import { IItemRepository } from "../repository/IItemRepository";
import UserRepositoryPg from "../repository/implementations/Postgres/UserRepositoryPg";

export class ItemService {
    private itemRepository: IItemRepository;

    constructor(itemRepository: IItemRepository) {
        this.itemRepository = itemRepository;
    }

    /**
     *
     * @param transferItemBody
     * @returns boolean
     * @requirements
     * 1. The source user must exists
     * 2. The target user must exists
     * 3. The items must belong to the source user
     * 4. The items must not belong to a character
     * 5. The items must be transferred to the target user
     */
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

        const itemsNotBelongsToCharacter = items.filter(
            (item) => item.characterId === null,
        );

        if (
            itemsNotBelongsToCharacter.length !==
            transferItemBody.itemsId.length
        ) {
            logger.error("Some items belong to a character");
            throw new Error("Some items belong to a character");
        }

        await this.itemRepository.transferItems(transferItemBody);

        return true;
    }

    /**
     * @param discardItemsBody
     * @returns true if the items were discarded of the user inventory
     * @trhows Error if the some of the requirements are not met
     * @requirements
     * 1. The user must exists
     * 2. The item must belong to the user
     * 3. The item must not belong to any character
     * 4. The item must be discarded
     */
    async discardMany(discardItemsBody: any): Promise<boolean> {
        // I need to check if the user exists in the database
        // and if the item belongs to the user
        const userRepository = new UserRepositoryPg();
        const user = await userRepository.findById(discardItemsBody.userId);

        if (!user) {
            logger.error("User %d does not exist", discardItemsBody.userId);
            throw new Error("User does not exist");
        }

        console.log("No server: ", discardItemsBody);

        const ownedItems = await this.itemRepository.findManyByUserId(
            discardItemsBody.userId,
            discardItemsBody.itemsId,
        );

        console.log("ownedItems: ", ownedItems);

        if (ownedItems !== discardItemsBody.itemsId.length) {
            logger.error(
                "Some items do not belong to the user %d",
                discardItemsBody.userId,
            );
            throw new Error("Some items do not belong to the user");
        }

        const items = await this.itemRepository.findByIds(
            discardItemsBody.itemsId,
        );

        const itemsNotBelongsToCharacter = items.filter(
            (item) => item.characterId === null,
        );

        if (
            itemsNotBelongsToCharacter.length !==
            discardItemsBody.itemsId.length
        ) {
            logger.error("Some items belong to a character");
            throw new Error("Some items belong to a character");
        }

        await Promise.all(
            discardItemsBody.itemsId.map((itemId: any) =>
                this.itemRepository.discard(itemId),
            ),
        );

        return true;
    }
}
