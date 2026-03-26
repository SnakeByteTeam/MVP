import { Plant } from 'src/plant/domain/models/plant.model';
import { FindPlantByIdCmd } from '../../commands/find-plant-by-id.command';

export interface FindPlantByIdUseCase {
  findById(cmd: FindPlantByIdCmd): Promise<Plant>;
}

export const FIND_PLANT_BY_ID_USECASE = Symbol('FindPlantByIdUseCase');
