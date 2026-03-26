import { Inject, Injectable } from '@nestjs/common';
import { Plant } from 'src/plant/domain/models/plant.model';
import { FindPlantByIdUseCase } from '../ports/in/find-plant-by-id.usecase';
import {
  FIND_PLANT_BY_ID_PORT,
  type FindPlantByIdPort,
} from '../ports/out/find-plant-by-id.port';
import { FindPlantByIdCmd } from '../commands/find-plant-by-id.command';

@Injectable()
export class PlantService implements FindPlantByIdUseCase {
  constructor(
    @Inject(FIND_PLANT_BY_ID_PORT)
    private readonly findByIdPort: FindPlantByIdPort,
  ) {}

  async findById(cmd: FindPlantByIdCmd): Promise<Plant> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    const plant: Plant | null = await this.findByIdPort.findById(cmd);
    if (!plant) throw new Error(`Plant ${plantId} not found`);

    return plant;
  }
}
