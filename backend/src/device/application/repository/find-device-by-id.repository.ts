import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';

export interface FindDeviceByIdRepoPort {
  findById(id: string): Promise<DeviceEntity | null>;
}

export const FIND_DEVICE_BY_ID_REPO_PORT = Symbol('FindDeviceByIdRepoPort');
