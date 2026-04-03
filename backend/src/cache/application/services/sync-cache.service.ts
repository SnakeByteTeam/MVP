import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Plant } from 'src/plant/domain/models/plant.model';

import {
  FETCH_NEW_CACHE_PORT,
  type FetchNewCachePort,
} from '../ports/out/fetch-new-cache.port';
import {
  WRITE_CACHE_PORT,
  type WriteCachePort,
} from '../ports/out/write-cache.port';
import { UpdateCacheUseCase } from '../ports/in/update-cache.usecase';
import { GetValidCacheCmd } from '../commands/get-valid-cache.command';
import { UpdateCacheAllPlantsUseCase } from '../ports/in/update-cache-all-plants.usecase';
import {
  GET_ALL_PLANTIDS_PORT,
  type GetAllPlantIdsPort,
} from '../ports/out/get-all-plantids.port';

@Injectable()
export class SyncCacheService
  implements UpdateCacheUseCase, UpdateCacheAllPlantsUseCase
{
  constructor(
    @Inject(FETCH_NEW_CACHE_PORT)
    private readonly fetchCachePort: FetchNewCachePort,
    @Inject(WRITE_CACHE_PORT)
    private readonly writeStructurePort: WriteCachePort,
    @Inject(GET_ALL_PLANTIDS_PORT)
    private readonly getAllPlantIdsPort: GetAllPlantIdsPort,
    private readonly emitter: EventEmitter2,
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

      this.emitter.emit('cache.updated', { plantId: cmd.plantId });

      return true;
    } catch (error) {
      throw error;
    }
  }

  async updateAllCache(): Promise<boolean> {
    const plantIds: string[] = await this.getAllPlantIdsPort.getAllPlantIds();
    let hasErrors = false;

    for (const plantId of plantIds) {
      try {
        const fetchedPlant: Plant = await this.fetchCachePort.fetch({
          plantId,
        });

        const writeResult =
          await this.writeStructurePort.writeStructure(fetchedPlant);

        if (!writeResult)
          throw new Error(`Failed to write cache for plantId: ${plantId}`);
        else console.log(`Cache updated successfully for plantId: ${plantId}`);
      } catch (error) {
        hasErrors = true;
        console.error(
          `Error updating cache for plantId: ${plantId}. Error: ${error}`,
        );
      }
    }

    this.emitter.emit('cache.all.updated');
    return !hasErrors;
  }
}
