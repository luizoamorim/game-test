import {
    IsInt,
    IsEmail,
    IsArray,
    ValidateNested,
    IsOptional,
    validateOrReject,
} from "class-validator";
import { Type } from "class-transformer";
import { Item } from "./Item";
import Character from "./Character";

export class User {
    @IsInt()
    id: number;

    @IsEmail({}, { message: "Invalid email format." })
    email: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Character)
    @IsOptional()
    characters?: Character[];

    @IsArray()
    // @validateNested means that will be validated by the Item class
    @ValidateNested({ each: true })
    @Type(() => Item)
    @IsOptional()
    inventory?: Item[];

    async validate() {
        await validateOrReject(this);
    }
}
