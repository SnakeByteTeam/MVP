import { Plant } from "src/plant/domain/models/plant.model";
import { GetValidCacheCmd } from "../../commands/get-valid-cache.command";

export interface GetValidCachePort {
    getValidCache(cmd: GetValidCacheCmd): Promise<Plant>;
}

export const GET_VALID_CACHE_PORT = Symbol('GetValidCachePort');