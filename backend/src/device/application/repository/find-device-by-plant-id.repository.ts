import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';

export interface FindDeviceByPlantIdRepoPort {
  findByPlantId(plantId: string): Promise<DeviceEntity[] | null>;
}

export const FIND_DEVICE_BY_PLANT_ID_REPO_PORT = Symbol(
  'FindDeviceByPlantIdRepoPort',
);
