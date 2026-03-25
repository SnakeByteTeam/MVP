import { PlantEntity } from "src/plant/infrastructure/persistence/entities/plant.entity";

export interface FindPlantByIdRepoPort {
	findById(plantId: string): Promise<PlantEntity | null>;
}

export const FIND_PLANT_BY_ID_REPO_PORT = Symbol('FindPlantByIdRepoPort');