import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';

export interface FindDeviceByDatapointIdRepoPort {
  findByDatapointId(datapointId: string): Promise<DeviceEntity | null>;
}

export const FIND_DEVICE_BY_DATAPOINTID_REPO_PORT = Symbol(
  'FindDeviceByDatapointIdRepoPort',
);
