import { Plant } from "src/plant/domain/models/plant.model";
import { ReadCacheCmd } from "../../commands/read-cache.command";

export interface ReadCachePort {
    readCache(cmd: ReadCacheCmd): Promise<Plant | null>;
}

export const READ_CACHE_PORT = Symbol('ReadCachePort');