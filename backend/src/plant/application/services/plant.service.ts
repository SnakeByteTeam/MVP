import { Inject, Injectable } from '@nestjs/common';
import { Plant } from 'src/plant/domain/models/plant.model';
import { FindPlantByIdUseCase } from '../ports/in/find-plant-by-id.usecase';
import {
  FIND_PLANT_BY_ID_PORT,
  type FindPlantByIdPort,
} from '../ports/out/find-plant-by-id.port';
import { FindPlantByIdCmd } from '../commands/find-plant-by-id.command';
import { FindAllAvailablePlantsUseCase } from '../ports/in/find-all-available-plants.usecase';
import {
  FIND_ALL_AVAILABLE_PLANTS_PORT,
  type FindAllAvailablePlantsPort,
} from '../ports/out/find-all-available-plants.port';
import { FindAllPlantsUseCase } from '../ports/in/find-all-plants.usecase';
import { FIND_ALL_PLANTS_PORT, type FindAllPlantsPort } from '../ports/out/find-all-plants.port';

@Injectable()
export class PlantService
  implements FindPlantByIdUseCase, FindAllAvailablePlantsUseCase, FindAllPlantsUseCase
{
  constructor(
    @Inject(FIND_PLANT_BY_ID_PORT)
    private readonly findByIdPort: FindPlantByIdPort,
    @Inject(FIND_ALL_AVAILABLE_PLANTS_PORT)
    private readonly findAllAvailablePlantsPort: FindAllAvailablePlantsPort,
    @Inject(FIND_ALL_PLANTS_PORT)
    private readonly findAllPlantsPort: FindAllPlantsPort
  ) {}

  async findById(cmd: FindPlantByIdCmd): Promise<Plant> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    const plant: Plant | null = await this.findByIdPort.findById(cmd);
    if (!plant) throw new Error(`Plant ${plantId} not found`);

    return plant;
  }

  async findAllAvailablePlants(): Promise<Plant[]> {
    const plant: Plant[] | null =
      await this.findAllAvailablePlantsPort.findAllAvailablePlants();
    if (!plant) throw new Error(`No available plants found`);

    return plant;
  }

  async findAllPlants(): Promise<Plant[]> {
    const plant: Plant[] | null = await this.findAllPlantsPort.findAllPlants();
    if(!plant) throw new Error(`No plants found`);

    return plant;
  }
}
