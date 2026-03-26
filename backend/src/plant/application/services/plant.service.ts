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

  constructor(
    @Inject(SYNC_PLANT_STRUCTURE_USECASE)
    private readonly syncPlantStructure: SyncPlantStructureUseCase,
    @Inject(FIND_PLANT_BY_ID_PORT)
    private readonly findByIdPort: FindPlantByIdPort,
  ) {}

  async findById(cmd: FindPlantByIdCmd): Promise<Plant> {
    const cached: Plant | null = await this.findByIdPort.findById(cmd);

    if(cached) return cached;

    const synced = await this.syncPlantStructure.sync({id: cmd?.id});
    if (!synced) throw(new Error(`Failed to sync plant ${cmd.id}`));

    const plant: Plant | null = await this.findByIdPort.findById(cmd);

    if(!plant) throw(new Error(`Plant ${cmd.id} not found after sync`));

    return plant

  }
}
