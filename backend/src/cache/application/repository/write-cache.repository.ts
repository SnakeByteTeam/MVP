import { PlantEntity } from 'src/cache/infrastructure/persistence/entities/plant.entity';

export interface WriteCacheRepoPort {
  write(plant: PlantEntity): Promise<boolean>;
}

export const WRITE_CACHE_REPO_PORT = Symbol('WriteCacheRepoPort');
