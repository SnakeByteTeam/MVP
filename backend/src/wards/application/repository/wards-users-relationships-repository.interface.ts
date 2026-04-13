import { UserEntity } from "src/wards/infrastructure/entities/user-entity";

export interface WardsUsersRelationshipsRepository {
    addUserToWard(wardId: number, userId: number): Promise<UserEntity>;
    findAllUsersByWardId(wardId: number): Promise<UserEntity[]>;
    removeUserFromWard(wardId: number, userId: number): Promise<void>;
}

export const WARDS_USERS_RELATIONSHIPS_REPOSITORY = 'WARDS_USERS_RELATIONSHIPS_REPOSITORY';
