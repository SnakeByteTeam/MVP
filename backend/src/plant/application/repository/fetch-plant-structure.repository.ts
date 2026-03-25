import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';

export interface FetchPlantStructureRepo {
  fetch(validToken: string, plantId: string): Promise<PlantDto | null>;
}

export const FETCH_PLANT_STRUCTURE_REPO_PORT = Symbol(
  'FetchPlantStructureRepo',
);
