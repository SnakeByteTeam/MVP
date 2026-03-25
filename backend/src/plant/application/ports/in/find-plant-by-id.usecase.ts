import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';
import { Plant } from 'src/plant/domain/models/plant.model';

export interface FindPlantByIdUseCase {
  findById(cmd: FindDeviceByIdCmd): Promise<Plant>;
}

export const FIND_PLANT_BY_ID_USECASE = Symbol('FindPlantByIdUseCase');
