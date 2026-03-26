import { Plant } from 'src/plant/domain/models/plant.model';
import { FetchNewCacheCmd } from '../../commands/fetch-new-cache.command';

export interface FetchNewCachePort {
  fetch(cmd: FetchNewCacheCmd): Promise<Plant>;
}

export const FETCH_NEW_CACHE_PORT = Symbol('FetchNewCachePort');
