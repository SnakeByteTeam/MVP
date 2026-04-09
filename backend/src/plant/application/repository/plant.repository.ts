import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

export interface PlantRepositoryPort {
  findAllAvailablePlants(): Promise<PlantEntity[] | null>;
  findAllPlants(): Promise<PlantEntity[] | null>;
  findById(plantId: string): Promise<PlantEntity | null>;
}

export const PLANT_REPOSITORY_PORT = Symbol('PlantRepositoryPort');
