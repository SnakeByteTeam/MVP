import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

export interface FindAllPlantsRepoPort {
  findAllPlants(): Promise<PlantEntity[] | null>;
}

export const FIND_ALL_PLANTS_REPO_PORT = Symbol('FindAllPlantsRepoPort');
