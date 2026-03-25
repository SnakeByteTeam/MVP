import { Plant } from 'src/plant/domain/models/plant.model';

export interface FetchPlantStructurePort {
  fetch(plantId: string): Promise<Plant>;
}

export const FETCH_PLANT_STRUCTURE_PORT = Symbol('FetchPlantStructurePort');
