import { PrismaClient } from "@prisma/client";
import { User } from "../../../entity/User";
import IUserRepository from "../../IUserRepository";

export default class UserRepositoryPg implements IUserRepository {
    prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async save(user: User): Promise<User> {
        const userCreated = await this.prisma.user.create({
            data: user as any,
        });
        return userCreated as User;
    }

    async findById(UserId: number): Promise<User | undefined> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: UserId,
            },
        });
        return user as User;
    }

    async delete(UserId: number): Promise<number> {
        const userDeleted = await this.prisma.user.delete({
            where: {
                id: UserId,
            },
        });
        return userDeleted.id;
    }
}
