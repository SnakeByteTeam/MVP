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
import {
  READ_CACHE_PORT,
  type ReadCachePort,
} from '../ports/out/read-cache.port';

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
      console.log(
        `[SyncCacheService] Fetched plant:`,
        fetchedPlant ? 'success' : 'failed',
      );

      const writeResult =
        await this.writeStructurePort.writeStructure(fetchedPlant);
      console.log(`[SyncCacheService] Write result:`, writeResult);

      if (!writeResult) throw new Error('Failed to write cache');

      console.log(`[SyncCacheService] Cache written successfully`);
      return true;
    } catch (error) {
      console.error(`[SyncCacheService] Error during fetch/write:`, error);
      throw error;
    }
  }
}
