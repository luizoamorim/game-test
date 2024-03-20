import { User } from "../entity/User";

export default interface IUserRepository {
    save(User: User): Promise<User>;
    findById(UserId: number): Promise<User | undefined>;
    delete(UserId: number): Promise<number>;
}
