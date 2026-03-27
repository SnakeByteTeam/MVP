import { Inject, Injectable } from '@nestjs/common';
import { Plant } from 'src/plant/domain/models/plant.model';

import {
  FETCH_NEW_CACHE_PORT,
  type FetchNewCachePort,
} from '../ports/out/fetch-new-cache.port';
import {
  WRITE_CACHE_PORT,
  type WriteCachePort,
} from '../ports/out/write-cache.port';
import { UpdateCacheUseCase } from '../ports/in/get-valid-cache.usecase';
import { GetValidCacheCmd } from '../commands/get-valid-cache.command';

@Injectable()
export class SyncCacheService implements UpdateCacheUseCase {
  constructor(
    @Inject(FETCH_NEW_CACHE_PORT)
    private readonly fetchCachePort: FetchNewCachePort,
    @Inject(WRITE_CACHE_PORT)
    private readonly writeStructurePort: WriteCachePort,
  ) {}

  async updateCache(cmd: GetValidCacheCmd): Promise<boolean> {
    if (!cmd?.plantId) throw new Error('PlantId is null');

    try {
      const fetchedPlant: Plant = await this.fetchCachePort.fetch({
        plantId: cmd.plantId,
      });

      const writeResult =
        await this.writeStructurePort.writeStructure(fetchedPlant);

      if (!writeResult) throw new Error('Failed to write cache');

      return true;
    } catch (error) {
      throw error;
    }
  }
}
