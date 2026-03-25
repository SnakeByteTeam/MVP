import { Inject, Injectable } from '@nestjs/common';
import { Plant } from 'src/plant/domain/models/plant.model';
import { FindPlantByIdUseCase } from '../ports/in/find-plant-by-id.usecase';
import {
  FIND_PLANT_BY_ID_PORT,
  type FindPlantByIdPort,
} from '../ports/out/find-plant-by-id.port';
import {
  SYNC_PLANT_STRUCTURE_USECASE,
  type SyncPlantStructureUseCase,
} from '../ports/in/sync-plant-structure.usecase';
import { FindPlantByIdCmd } from '../commands/find-plant-by-id.command';
import { SyncPlantCmd } from '../commands/sync-plant.command';

@Injectable()
export class PlantService implements FindPlantByIdUseCase {
  private static readonly TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

  constructor(
    @Inject(SYNC_PLANT_STRUCTURE_USECASE)
    private readonly syncPlantStructure: SyncPlantStructureUseCase,
    @Inject(FIND_PLANT_BY_ID_PORT)
    private readonly findByIdPort: FindPlantByIdPort,
  ) {}

  async findById(cmd: FindPlantByIdCmd): Promise<Plant> {
    try {
      const plant: Plant = await this.findByIdPort.findById(cmd);

      const cacheIsStale =
        plant.getCachedAt().getTime() <
        Date.now() - PlantService.TWELVE_HOURS_MS;

      if (!cacheIsStale) {
        return plant;
      }

      const syncCmd: SyncPlantCmd = { id: cmd?.id };
      const synced = await this.syncPlantStructure.sync(syncCmd);
      if (!synced) {
        return plant;
      }

      return await this.findByIdPort.findById(cmd);
    } catch (err) {
      const syncCmd: SyncPlantCmd = { id: cmd?.id };
      if (!(await this.syncPlantStructure.sync(syncCmd))) {
        throw err;
      }
      return await this.findByIdPort.findById(cmd);
    }
  }
}
