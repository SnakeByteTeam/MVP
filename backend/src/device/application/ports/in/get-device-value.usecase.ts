import { DeviceValue } from 'src/device/domain/models/device-value.model';
import { GetDeviceValueCmd } from '../../commands/get-device-value.command';

export interface GetDeviceValueUseCase {
  getDeviceValue(cmd: GetDeviceValueCmd): Promise<DeviceValue>;
}

export const GET_DEVICE_VALUE_USECASE = Symbol('GetDeviceValueUseCase');
