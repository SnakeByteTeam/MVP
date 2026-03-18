import { UserEntity } from "../../infrastructure/entities/user-entity";

export interface FindAllUsersRepository {
    findAllUsers(): UserEntity[];
}
