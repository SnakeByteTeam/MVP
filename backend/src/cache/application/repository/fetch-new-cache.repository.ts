import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';

export interface FetchNewCacheRepoPort {
  fetch(validToken: string, plantId: string): Promise<PlantDto | null>;
}

export const FETCH_NEW_CACHE_REPO_PORT = Symbol('FetchNewCacheRepoPort');
