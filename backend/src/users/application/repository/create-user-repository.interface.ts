import { UserEntity } from "../../infrastructure/entities/user-entity";

export interface CreateUserRepository {
    createUser(
        username: string,
        surname: string,
        name: string,
        tempPassword: string
    ): UserEntity;
}

export const CREATE_USER_REPOSITORY = 'CREATE_USER_REPOSITORY';