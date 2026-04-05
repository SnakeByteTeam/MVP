import { UserEntity } from "../../infrastructure/entities/user-entity";

export interface FindUserByIdRepository {
    findUserById(id: number): Promise<UserEntity | null>;
}

export const FIND_USER_BY_ID_REPOSITORY = 'FIND_USER_BY_ID_REPOSITORY';
