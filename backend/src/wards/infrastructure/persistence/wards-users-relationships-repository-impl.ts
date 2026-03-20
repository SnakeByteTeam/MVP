import { AddPlantToWardRepository } from "../../application/repository/add-plant-to-ward-repository.interface";
import { FindAllPlantsByWardIdRepository } from "../../application/repository/find-all-plants-by-ward-id-repository.interface";
import { RemovePlantFromWardRepository } from "../../application/repository/remove-plant-from-ward-repository.interface";

export class WardsUsersRelationshipsRepositoryImpl implements 
    AddPlantToWardRepository, 
    FindAllPlantsByWardIdRepository, 
    RemovePlantFromWardRepository {
        
    addPlantToWard(wardId: number, plantId: number) {
        throw new Error("Method not implemented.");
    }
    findAllPlantsByWardId(wardId: number) {
        throw new Error("Method not implemented.");
    }
    removePlantToWard(wardId: number, plantId: number) {
        throw new Error("Method not implemented.");
    }
}
