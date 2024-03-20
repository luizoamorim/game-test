import {
    IsInt,
    IsString,
    IsArray,
    ValidateNested,
    validateOrReject,
} from "class-validator";
import { Type } from "class-transformer";
import { Item } from "./Item";

export class ItemType {
    @IsInt()
    id: number;

    @IsString({ message: "Name must be a string." })
    name: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Item)
    items: Item[];

    async validate() {
        await validateOrReject(this);
    }
}
