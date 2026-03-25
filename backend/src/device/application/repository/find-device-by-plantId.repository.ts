import { DeviceEntity } from 'src/device/infrastructure/entities/device.entity';

export interface FindDeviceByPlantIdRepoPort {
  findByPlantId(plantId: string): Promise<DeviceEntity[] | null>;
}

export const FIND_DEVICE_BY_PLANTID_REPO_PORT = Symbol(
  'FindDeviceByPlantIdRepoPort',
);
