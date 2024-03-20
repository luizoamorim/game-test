import Result from "../../types/Result";
import { EquipItemBody } from "../entity/EquipItemBody";
import ICharacterRepository from "../repository/ICharacterRepository";
import { IItemRepository } from "../repository/IItemRepository";
import { CharacterService } from "../service/CharacterService";

export class CharacterController {
    private characterService: CharacterService;

    constructor(
        characterRepository: ICharacterRepository,
        itemRepository: IItemRepository,
    ) {
        this.characterService = new CharacterService(
            characterRepository,
            itemRepository,
        );
    }

    async equip(equipItemBody: EquipItemBody): Promise<Result | null> {
        const result = await this.characterService.equip(equipItemBody);
        if (!result) {
            return null;
        }
        return {
            httpStatusCode: 200,
            message: "Caracter equiped successfully",
            data: null,
        };
    }
}
