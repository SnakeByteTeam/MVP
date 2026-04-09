import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';
import { DatapointExtractedDto } from 'src/device/infrastructure/http/dtos/in/datapoint-response.dto';

export interface DeviceRepositoryPort {
  findById(id: string): Promise<DeviceEntity | null>;
  findByPlantId(plantId: string): Promise<DeviceEntity[] | null>;
  findByDatapointId(datapointId: string): Promise<DeviceEntity | null>;
  ingestTimeseries(
    datapointId: string,
    value: string,
    timestamp: string,
  ): Promise<boolean>;
  getDeviceValue(
    validToken: string,
    plantId: string,
    deviceId: string,
  ): Promise<DatapointExtractedDto[]>;
  writeDeviceValue(
    validToken: string,
    plantId: string,
    datapointId: string,
    value: string,
  ): Promise<boolean>;
}

export const DEVICE_REPOSITORY_PORT = Symbol('DeviceRepositoryPort');
