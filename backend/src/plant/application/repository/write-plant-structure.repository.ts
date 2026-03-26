import { PlantEntity } from "src/cache/infrastructure/persistence/entities/plant.entity";

export interface WritePlantStructureRepoPort {
  write(plant: PlantEntity): Promise<boolean>;
}

export const WRITE_PLANT_STRUCTURE_REPO_PORT = Symbol(
  'WritePlantStructureRepoPort',
);
