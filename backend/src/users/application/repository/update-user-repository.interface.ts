import { UserEntity } from "../../infrastructure/entities/user-entity";

export interface UpdateUserRepository {
    updateUser(
        id: number,
        username: string,
        surname: string,
        name: string
    ): UserEntity;
}

export const UPDATE_USER_REPOSITORY = 'UPDATE_USER_REPOSITORY';