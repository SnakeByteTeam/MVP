import { Inject, Injectable } from '@nestjs/common';
import { SyncPlantStructureUseCase } from '../ports/in/sync-plant-structure.usecase';
import { Plant } from 'src/plant/domain/models/plant.model';

import {
  FETCH_PLANT_STRUCTURE_PORT,
  type FetchPlantStructurePort,
} from '../ports/out/fetch-plant-structure.port';
import {
  WRITE_STRUCTURE_PORT,
  type WritePlantStructurePort,
} from '../ports/out/write-plant-structure.port';
import { SyncPlantCmd } from '../commands/sync-plant.command';

@Injectable()
export class SyncPlantService implements SyncPlantStructureUseCase {
  constructor(
    @Inject(FETCH_PLANT_STRUCTURE_PORT)
    private readonly fetchStructurePort: FetchPlantStructurePort,
    @Inject(WRITE_STRUCTURE_PORT)
    private readonly writeStructurePort: WritePlantStructurePort,
  ) {}

  async sync(cmd: SyncPlantCmd): Promise<boolean> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    const newPlant: Plant = await this.fetchStructurePort.fetch(plantId);
    return await this.writeStructurePort.writeStructure(newPlant);
  }
}
