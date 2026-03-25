import { Plant } from "src/plant/domain/models/plant.model";

export interface FindPlantByIdUseCase {
    findById(plantId: string): Promise<Plant>;
}

export const FIND_PLANT_BY_ID_USECASE = Symbol('FindPlantByIdUseCase');