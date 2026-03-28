import { Plant } from "src/plant/domain/models/plant.model";

export interface FindAllAvailablePlantsPort {
    findAllAvailablePlants(): Promise<Plant[] | null>;
}

export const FIND_ALL_AVAILABLE_PLANTS_PORT = Symbol('FindAllAvailablePlantsPort');