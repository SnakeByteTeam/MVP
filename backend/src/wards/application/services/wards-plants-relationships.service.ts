import { Inject, Injectable } from '@nestjs/common';
import { AddPlantToWardUseCase } from '../ports/in/add-plant-to-ward-use-case.interface';
import { FindAllPlantsByWardIdUseCase } from '../ports/in/find-all-plants-by-ward-id-use-case.interface';
import { RemovePlantFromWardUseCase } from '../ports/in/remove-plant-from-ward-use-case.interface';
import { AddPlantToWardCmd } from '../commands/add-plant-to-ward-cmd';
import { FindAllPlantsByWardIdCmd } from '../commands/find-all-plants-by-ward-id-cmd';
import { RemovePlantFromWardCmd } from '../commands/remove-plant-from-ward-cmd';
import { ADD_PLANT_TO_WARD_PORT } from '../../adapters/out/add-plant-to-ward-adapter';
import { AddPlantToWardPort } from '../ports/out/add-plant-to-ward-port.interface';
import { FIND_ALL_PLANTS_BY_WARD_ID_PORT } from '../../adapters/out/find-all-plants-by-ward-id-adapter';
import { FindAllPlantsByWardIdPort } from '../ports/out/find-all-plants-by-ward-id-port.interface';
import { REMOVE_PLANT_FROM_WARD_PORT } from '../../adapters/out/remove-plant-from-ward-adapter';
import { RemovePlantFromWardPort } from '../ports/out/remove-plant-from-ward-port.interface';
import { Plant } from '../../domain/plant';

@Injectable()
export class WardsPlantsRelationshipsService
  implements
    AddPlantToWardUseCase,
    FindAllPlantsByWardIdUseCase,
    RemovePlantFromWardUseCase
{
  constructor(
    @Inject(ADD_PLANT_TO_WARD_PORT)
    private readonly addPlantToWardPort: AddPlantToWardPort,
    @Inject(FIND_ALL_PLANTS_BY_WARD_ID_PORT)
    private readonly findAllPlantsByWardIdPort: FindAllPlantsByWardIdPort,
    @Inject(REMOVE_PLANT_FROM_WARD_PORT)
    private readonly removePlantFromWardPort: RemovePlantFromWardPort,
  ) {}

  async addPlantToWard(req: AddPlantToWardCmd): Promise<Plant> {
    return await this.addPlantToWardPort.addPlantToWard(req);
  }
  findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd): Promise<Plant[]> {
    return this.findAllPlantsByWardIdPort.findAllPlantsByWardId(req);
  }
  removePlantFromWard(req: RemovePlantFromWardCmd) {
    return this.removePlantFromWardPort.removePlantFromWard(req);
  }
}

export const ADD_PLANT_TO_WARD_USE_CASE = 'ADD_PLANT_TO_WARD_USE_CASE';
export const FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE =
  'FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE';
export const REMOVE_PLANT_FROM_WARD_USE_CASE =
  'REMOVE_PLANT_FROM_WARD_USE_CASE';
