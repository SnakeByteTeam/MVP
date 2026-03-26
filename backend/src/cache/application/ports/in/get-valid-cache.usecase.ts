
import { GetValidCacheCmd } from '../../commands/get-valid-cache.command';

export interface UpdateCacheUseCase {
  updateCache(cmd: GetValidCacheCmd): Promise<boolean>;
}

export const UPDATE_CACHE_USE_CASE = Symbol('UpdateCacheUseCase');
