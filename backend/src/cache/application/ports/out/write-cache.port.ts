import { Plant } from 'src/plant/domain/models/plant.model';

export interface WriteCachePort {
  writeStructure(plant: Plant): Promise<boolean>;
}

export const WRITE_CACHE_PORT = Symbol('WriteCachePort');
