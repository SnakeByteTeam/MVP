import { UserEntity } from "../../infrastructure/entities/user-entity";

export interface CreateUserRepository {
    createUser(
        username: string,
        surname: string,
        name: string,
        tempPassword: string
    ): UserEntity;
}
