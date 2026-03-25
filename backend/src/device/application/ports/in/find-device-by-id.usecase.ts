import { Device } from 'src/device/domain/models/device.model';
import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';

export interface FindDeviceByIdUseCase {
  findById(cmd: FindDeviceByIdCmd): Promise<Device>;
}

export const FIND_DEVICE_BY_ID_USECASE = Symbol('FindDeviceByIdUseCase');
