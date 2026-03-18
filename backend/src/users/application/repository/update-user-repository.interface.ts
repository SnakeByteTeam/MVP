import { UserEntity } from "../../infrastructure/entities/user-entity";

export interface UpdateUserRepository {
    updateUser(
        id: number,
        username: string,
        surname: string,
        name: string,
        role: string
    ): UserEntity;
}
