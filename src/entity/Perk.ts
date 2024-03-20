import { IsInt, IsString, validateOrReject } from "class-validator";

export class Perk {
    @IsInt({ message: "Id must be an integer." })
    id: number;

    @IsString({ message: "Name must be a string." })
    name: string;

    @IsString({ message: "Effect must be a string." })
    effect: string;

    async validate() {
        await validateOrReject(this);
    }
}
