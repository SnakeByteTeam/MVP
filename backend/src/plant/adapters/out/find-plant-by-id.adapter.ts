import { Inject, Injectable } from '@nestjs/common';
import {
  UPDATE_CACHE_USE_CASE,
  type UpdateCacheUseCase,
} from 'src/cache/application/ports/in/get-valid-cache.usecase';
import { FindPlantByIdCmd } from 'src/plant/application/commands/find-plant-by-id.command';
import { FindPlantByIdPort } from 'src/plant/application/ports/out/find-plant-by-id.port';

import { Plant } from 'src/plant/domain/models/plant.model';

@Injectable()
export class FindPlantByIdAdapter implements FindPlantByIdPort {
  constructor(
    @Inject(UPDATE_CACHE_USE_CASE)
    private readonly structureCache: UpdateCacheUseCase,
  ) {}

  async findById(cmd: FindPlantByIdCmd): Promise<Plant | null> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    const plant: Plant = await this.structureCache.updateCache({
      plantId: plantId,
    });

    if (!plant) return null;

    return plant;
  }
}
