import { IsInt, IsArray, validateOrReject } from "class-validator";

export class DiscardItemsBody {
    @IsInt({ message: "User ID must be an integer." })
    userId: number;

    @IsArray({ message: "Items ID must be an array of integers." })
    @IsInt({ each: true, message: "Each Item ID must be an integer." })
    itemsId: Array<number>;

    async validate() {
        await validateOrReject(this);
    }
}
