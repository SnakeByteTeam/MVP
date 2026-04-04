import { Plant } from "src/plant/domain/models/plant.model";

export interface FindAllPlantsPort {
    findAllPlants(): Promise<Plant[] | null>;
}

export const FIND_ALL_PLANTS_PORT = Symbol('FindAllPlantsPort');