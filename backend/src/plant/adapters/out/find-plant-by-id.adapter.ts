import { Inject, Injectable } from '@nestjs/common';
import { GET_VALID_CACHE_PORT,type GetValidCachePort } from 'src/cache/application/ports/out/get-valid-cache.port';
import { FindPlantByIdCmd } from 'src/plant/application/commands/find-plant-by-id.command';
import { FindPlantByIdPort } from 'src/plant/application/ports/out/find-plant-by-id.port';

import { Plant } from 'src/plant/domain/models/plant.model';


@Injectable()
export class FindPlantByIdAdapter implements FindPlantByIdPort {
  constructor(
    @Inject(GET_VALID_CACHE_PORT)
    private readonly structureCache: GetValidCachePort,
  ) {}

  async findById(cmd: FindPlantByIdCmd): Promise<Plant | null> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    const plant: Plant =
      await this.structureCache.getValidCache({ plantId: plantId });

    if (!plant) return null;

    return plant;
  }
}
