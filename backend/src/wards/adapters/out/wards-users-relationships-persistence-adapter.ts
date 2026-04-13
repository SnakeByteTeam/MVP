import { Inject } from "@nestjs/common";
import { AddUserToWardCmd } from "src/wards/application/commands/add-user-to-ward-cmd";
import { FindAllUsersByWardIdCmd } from "src/wards/application/commands/find-all-users-by-ward-id-cmd";
import { RemoveUserFromWardCmd } from "src/wards/application/commands/remove-user-from-ward-cmd";
import { WARDS_USERS_RELATIONSHIPS_REPOSITORY, WardsUsersRelationshipsRepository } from "src/wards/application/repository/wards-users-relationships-repository.interface";
import { User } from "src/wards/domain/user";
import { UserEntity } from "src/wards/infrastructure/entities/user-entity";

export class WardsUsersRelationshipsPersistenceAdapter {
    constructor(
        @Inject(WARDS_USERS_RELATIONSHIPS_REPOSITORY)
        private readonly wardsUsersRelationshipsRepository: WardsUsersRelationshipsRepository,
    ) { }

    async addUserToWard(req: AddUserToWardCmd): Promise<User> {
        const userEntity: UserEntity =
            await this.wardsUsersRelationshipsRepository.addUserToWard(req.wardId, req.userId);

        return new User(userEntity.id, userEntity.username);
    }

    async findAllUsersByWardId(req: FindAllUsersByWardIdCmd): Promise<User[]> {
        const userEntities: UserEntity[] =
            await this.wardsUsersRelationshipsRepository.findAllUsersByWardId(req.id);

        return userEntities.map(
            (userEntity) => new User(userEntity.id, userEntity.username),
        );
    }

    async removeUserFromWard(req: RemoveUserFromWardCmd): Promise<void> {
        return await this.wardsUsersRelationshipsRepository.removeUserFromWard(
            req.wardId,
            req.userId,
        );
    }
}
