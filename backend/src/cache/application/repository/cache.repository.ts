import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

export interface CacheRepositoryPort {
  fetch(validToken: string, plantId: string): Promise<PlantDto | null>;
  getAllPlantIds(validToken: string): Promise<string[]>;
  write(plant: PlantEntity): Promise<boolean>;
}

export const CACHE_REPOSITORY_PORT = Symbol('CacheRepositoryPort');
