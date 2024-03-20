import ICharacterRepository from "../repository/ICharacterRepository";
import { IItemRepository } from "../repository/IItemRepository";

export class CharacterService {
    private characterRepository: ICharacterRepository;
    private itemRepository: IItemRepository;

    constructor(
        characterRepository: ICharacterRepository,
        itemRepository: IItemRepository,
    ) {
        this.characterRepository = characterRepository;
        this.itemRepository = itemRepository;
    }

    /**
     *
     * @param equipItemBody
     * @requirements
     * 1. The character must exists
     * 2. The User must have the character
     * 3. The User must have the item in its inventory
     * 4. The item must not belong to another character
     */
    async equip(equipItemBody: any): Promise<boolean> {
        //1. The character must exists
        const character = await this.characterRepository.findById(
            equipItemBody.characterId,
        );

        if (!character) {
            throw new Error("Character not found");
        }

        //2. The User must have the character
        if (character.userId !== equipItemBody.userId) {
            throw new Error("Character does not belong to the user");
        }

        //3. The User must have the item in its inventory
        const items = await this.itemRepository.findByIds(
            equipItemBody.itemsId,
        );
        const ownedItems = items.filter(
            (item) => item.ownerId === equipItemBody.userId,
        );
        if (ownedItems.length !== equipItemBody.itemsId.length) {
            throw new Error("Some items do not belong to the user");
        }

        //4. The item must not belong to another character
        const itemsNotBelongsToCharacter = items.filter(
            (item) => item.characterId !== null,
        );
        if (itemsNotBelongsToCharacter.length !== 0) {
            throw new Error("Some items belong to a character");
        }

        // Update the items to belong to the character
        console.log("equipItemBody", equipItemBody);
        equipItemBody.itemsId = items.forEach(async (item) => {
            await this.itemRepository.updateCharacterId(
                item.id,
                equipItemBody.characterId,
            );
        });

        return true;
    }
}
