import { Plant } from 'src/plant/domain/models/plant.model';

export interface FindAllPlantsUseCase {
  findAllPlants(): Promise<Plant[]>;
}

export const FIND_ALL_PLANTS_USECASE = Symbol('FindAllPlantsUseCase');
