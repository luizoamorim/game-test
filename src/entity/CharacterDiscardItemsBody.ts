import { IsInt, IsArray, validateOrReject } from "class-validator";

export class CharacterDiscardItemsBody {
    @IsInt({ message: "Character ID must be an integer." })
    characterId: number;

    @IsArray({ message: "Items ID must be an array of integers." })
    @IsInt({ each: true, message: "Each Item ID must be an integer." })
    itemsId: Array<number>;

    async validate() {
        await validateOrReject(this);
    }
}
