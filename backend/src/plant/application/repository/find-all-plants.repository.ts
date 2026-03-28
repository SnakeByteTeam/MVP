import { PlantEntity } from "src/plant/infrastructure/persistence/entities/plant.entity";

export interface FindAllAvailablePlantsRepoPort {
    findAllAvailablePlants(): Promise<PlantEntity[] | null>;
}

export const FIND_ALL_AVAILABLE_PLANTS_REPO_PORT = Symbol('FindAllAvailablePlantsRepoPort');