import { PlantEntity } from "../../infrastructure/entities/plant-entity";

export interface AddPlantToWardRepository {
  addPlantToWard(wardId: number, plantId: number): Promise<PlantEntity>;
}

export const ADD_PLANT_TO_WARD_REPOSITORY = 'ADD_PLANT_TO_WARD_REPOSITORY';
