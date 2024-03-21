import { IsInt, IsArray, validateOrReject } from "class-validator";

export class TransferItemBody {
    @IsInt({ message: "Source User ID must be an integer." })
    sourceUserId: number;

    @IsInt({ message: "Target User ID must be an integer." })
    targetUserId: number;

    @IsArray({ message: "Items ID must be an array of integers." })
    @IsInt({ each: true, message: "Each Item ID must be an integer." })
    itemsId: Array<number>;

    async validate() {
        await validateOrReject(this);
    }
}
