import { PlantEntity } from 'src/cache/infrastructure/persistence/entities/plant.entity';

export interface ReadCacheRepoPort {
  read(plantId: string): Promise<PlantEntity | null>;
}

export const READ_CACHE_REPO_PORT = Symbol('ReadCacheRepoPort');
