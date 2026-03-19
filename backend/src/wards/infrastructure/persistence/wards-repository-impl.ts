import { CreateWardRepository } from "../../application/repository/create-ward-repository.interface";
import { DeleteWardRepository } from "../../application/repository/delete-ward-repository.interface";
import { FindAllWardsRepository } from "../../application/repository/find-all-wards-repository.interface";
import { UpdateWardRepository } from "../../application/repository/update-ward-repository.interface";
import { WardEntity } from "../entities/ward-entity";

export class WardsRepositoryImpl implements 
CreateWardRepository, 
DeleteWardRepository, 
FindAllWardsRepository, 
UpdateWardRepository {
    createWard(name: string): WardEntity {
        throw new Error("Method not implemented.");
    }
    deleteWard(id: number) {
        throw new Error("Method not implemented.");
    }
    findAllWards(): WardEntity[] {
        throw new Error("Method not implemented.");
    }
    updateWard(id: number, name: string): WardEntity {
        throw new Error("Method not implemented.");
    }
}
