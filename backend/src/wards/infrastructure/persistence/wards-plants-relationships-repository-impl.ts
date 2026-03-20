import { AddUserToWardRepository } from "../../application/repository/add-user-to-ward-repository.interface";
import { FindAllUsersByWardIdRepository } from "../../application/repository/find-all-users-by-ward-id-repository.interface";
import { RemoveUserFromWardRepository } from "../../application/repository/remove-user-from-ward-repository.interface";

export class WardsPlantsRelationshipsRepositoryImpl implements 
    AddUserToWardRepository, 
    FindAllUsersByWardIdRepository, 
    RemoveUserFromWardRepository {

    findAllUsersByWardId(wardId: number) {
        throw new Error("Method not implemented.");
    }
    removeUserFromWard(wardId: number, userId: number) {
        throw new Error("Method not implemented.");
    }
    addUserToWard(wardId: number, userId: number) {
        throw new Error("Method not implemented.");
    }
}
