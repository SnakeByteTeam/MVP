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
import { GetValidCachePort } from '../ports/out/get-valid-cache.port';
import { GetValidCacheCmd } from '../commands/get-valid-cache.command';
import {
  READ_CACHE_PORT,
  type ReadCachePort,
} from '../ports/out/read-cache.port';

@Injectable()
export class SyncCacheService implements GetValidCachePort {
  constructor(
    @Inject(READ_CACHE_PORT)
    private readonly readCachePort: ReadCachePort,
    @Inject(FETCH_NEW_CACHE_PORT)
    private readonly fetchCachePort: FetchNewCachePort,
    @Inject(WRITE_CACHE_PORT)
    private readonly writeStructurePort: WriteCachePort,
  ) {}

  async getValidCache(cmd: GetValidCacheCmd): Promise<Plant> {
    if (!cmd?.plantId) throw new Error('PlantId is null');

    console.log(
      `[SyncCacheService] Getting valid cache for plantId: ${cmd.plantId}`,
    );

    const plant: Plant | null = await this.readCachePort.readCache({
      plantId: cmd.plantId,
    });
    console.log(
      `[SyncCacheService] Read cache result:`,
      plant ? 'found' : 'not found',
    );

    if (
      plant &&
      plant.getCachedAt() > new Date(Date.now() - 12 * 60 * 60 * 1000)
    ) {
      console.log(`[SyncCacheService] Cache is valid, returning`);
      return plant;
    }

    console.log(
      `[SyncCacheService] Cache is stale or missing, fetching new...`,
    );
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
      return fetchedPlant;
    } catch (error) {
      console.error(`[SyncCacheService] Error during fetch/write:`, error);
      throw error;
    }
  }
}
