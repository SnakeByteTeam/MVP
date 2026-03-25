import { Plant } from "src/plant/domain/models/plant.model";

export interface FindPlantByIdPort {
    findById(plantId: string): Promise<Plant>;
}

export const FIND_PLANT_BY_ID_PORT = Symbol('FindPlantByIdPort');