import {
    IsInt,
    IsString,
    ValidateNested,
    IsOptional,
    validateOrReject,
    IsArray,
} from "class-validator";
import { Type } from "class-transformer";
import { User } from "./User";
import { Item } from "./Item";

export default class Character {
    @IsInt({ message: "Id must be an integer." })
    id: number;

    @IsString({ message: "Name must be a string." })
    name: string;

    @IsInt({ message: "Level must be an integer." })
    level: number;

    @IsInt({ message: "Health must be an integer." })
    health: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Item)
    items: Item[];

    @ValidateNested()
    @Type(() => User)
    @IsOptional() // Assuming a character must not always be linked to a user when first created.
    user?: User;

    async validate() {
        await validateOrReject(this);
    }
}
