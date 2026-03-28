import { Plant } from "src/plant/domain/models/plant.model";

export interface FindAllAvailablePlantsUseCase {
    findAllAvailablePlants(): Promise<Plant[]>;
}   

export const FIND_ALL_AVAILABLE_PLANTS_USECASE = Symbol('FindAllAvailablePlantsUseCase');