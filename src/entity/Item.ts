import {
    IsInt,
    IsString,
    IsOptional,
    ValidateNested,
    IsArray,
    validateOrReject,
} from "class-validator";
import { Type } from "class-transformer";
import { ItemType } from "./ItemType";
import { Perk } from "./Perk";
import { User } from "./User";
import Character from "./Character";

export class Item {
    @IsInt({ message: "Id must be an integer." })
    id: number;

    @IsString({ message: "Name must be a string." })
    name: string;

    // @IsInt()
    // typeId: number; // Assuming you want to expose typeId for validation or other purposes

    @ValidateNested()
    @Type(() => ItemType)
    itemType: ItemType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Perk)
    @IsOptional()
    perks?: Perk[]; // Note: This assumes a direct relationship for simplicity

    @IsInt({ message: "OwnerId must be an integer." })
    @IsOptional()
    ownerId?: number;

    @ValidateNested()
    @Type(() => User)
    @IsOptional()
    owner?: User;

    @IsInt({ message: "CharacterId must be an integer." })
    @IsOptional()
    characterId?: number; // Added based on schema

    @ValidateNested()
    @Type(() => Character)
    @IsOptional()
    character?: Character; // Added based on schema

    async validate() {
        await validateOrReject(this);
    }
}
