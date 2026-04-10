import { Inject, Injectable } from '@nestjs/common';
import {
  DEVICE_REPOSITORY_PORT,
  DeviceRepositoryPort,
} from 'src/device/application/repository/device.repository';
import { GETVALIDTOKENPORT, GetValidTokenPort } from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { FindDeviceByIdPort } from 'src/device/application/ports/out/find-device-by-id.port';
import { FindDeviceByPlantIdPort } from 'src/device/application/ports/out/find-device-by-plantid.port';
import { FindDeviceByDatapointIdPort } from 'src/device/application/ports/out/find-device-by-datapointId';
import { IngestTimeseriesPort } from 'src/device/application/ports/out/ingest-timeseries.port';
import { GetDeviceValuePort } from 'src/device/application/ports/out/get-device-value.port';
import { WriteDatapointValuePort } from 'src/device/application/ports/out/write-device-value.port';
import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';
import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';
import { FindDeviceByDatapointIdCmd } from 'src/device/application/commands/find-device-by-datapointId.command';
import { IngestTimeseriesCmd } from 'src/device/application/commands/ingest-timeseries.command';
import { GetDeviceValueCmd } from 'src/device/application/commands/get-device-value.command';
import { WriteDatapointValueCmd } from 'src/device/application/commands/write-datapoint-value.command';
import { Device } from 'src/device/domain/models/device.model';
import {
  DatapointValue,
  DeviceValue,
} from 'src/device/domain/models/device-value.model';
import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';
import { DatapointExtractedDto } from 'src/device/infrastructure/http/dtos/in/datapoint-response.dto';

@Injectable()
export class DeviceAdapter
  implements
    FindDeviceByIdPort,
    FindDeviceByPlantIdPort,
    FindDeviceByDatapointIdPort,
    IngestTimeseriesPort,
    GetDeviceValuePort,
    WriteDatapointValuePort
{
  constructor(
    @Inject(DEVICE_REPOSITORY_PORT)
    private readonly deviceRepository: DeviceRepositoryPort,
    @Inject(GETVALIDTOKENPORT)
    private readonly getValidTokenPort: GetValidTokenPort,
  ) {}

  async findById(cmd: FindDeviceByIdCmd): Promise<Device> {
    if (!cmd.id) {
      throw new Error('[DEVICE ADAPTER] id is required');
    }

    const deviceEntity = await this.deviceRepository.findById(cmd.id);
    if (!deviceEntity) {
      throw new Error(`Device with id ${cmd.id} not found`);
    }

    return DeviceEntity.toDomain(deviceEntity);
  }

  async findByPlantId(cmd: FindDeviceByPlantIdCmd): Promise<Device[]> {
    if (!cmd.id) {
      throw new Error('[DEVICE ADAPTER] plantId is required');
    }

    const deviceEntities = await this.deviceRepository.findByPlantId(cmd.id);
    if (!deviceEntities) {
      throw new Error(`Devices for plant ${cmd.id} not found`);
    }

    return deviceEntities.map((entity) => DeviceEntity.toDomain(entity));
  }

  async findByDatapointId(
    cmd: FindDeviceByDatapointIdCmd,
  ): Promise<Device> {
    if (!cmd.datapointId) {
      throw new Error('[DEVICE ADAPTER] datapointId is required');
    }

    const deviceEntity = await this.deviceRepository.findByDatapointId(
      cmd.datapointId,
    );
    if (!deviceEntity) {
      throw new Error(`Device with datapoint ${cmd.datapointId} not found`);
    }

    return DeviceEntity.toDomain(deviceEntity);
  }

  async ingestTimeseries(cmd: IngestTimeseriesCmd): Promise<void> {
    if (!cmd.datapointId || !cmd.value || !cmd.timestamp) {
      throw new Error(
        '[DEVICE ADAPTER] datapointId, value, and timestamp are required',
      );
    }

    const result = await this.deviceRepository.ingestTimeseries(
      cmd.datapointId,
      cmd.value,
      cmd.timestamp,
    );

    if (!result) {
      throw new Error('[DEVICE ADAPTER] Failed to ingest timeseries');
    }
  }

  async getDeviceValue(cmd: GetDeviceValueCmd): Promise<DeviceValue> {
    if (!cmd.deviceId || !cmd.plantId) {
      throw new Error('[DEVICE ADAPTER] deviceId and plantId are required');
    }

    const validToken = await this.getValidTokenPort.getValidToken();
    if (!validToken) {
      throw new Error('[DEVICE ADAPTER] Failed to get valid token');
    }

    const entity: DatapointExtractedDto[] =
      await this.deviceRepository.getDeviceValue(
        validToken,
        cmd.plantId,
        cmd.deviceId,
      );

    const datapointValues: DatapointValue[] = entity.map((dp) =>
      DatapointExtractedDto.toDomain(dp),
    );
    return new DeviceValue(cmd.deviceId, datapointValues);
  }

  async writeDatapointValue(cmd: WriteDatapointValueCmd): Promise<void> {
    if (!cmd.datapointId || !cmd.plantId || !cmd.value) {
      throw new Error(
        '[DEVICE ADAPTER] datapointId, plantId, and value are required',
      );
    }

    const validToken = await this.getValidTokenPort.getValidToken();
    if (!validToken) {
      throw new Error('[DEVICE ADAPTER] Failed to get valid token');
    }

    const result = await this.deviceRepository.writeDeviceValue(
      validToken,
      cmd.plantId,
      cmd.datapointId,
      cmd.value,
    );

    if (!result) {
      throw new Error('[DEVICE ADAPTER] Failed to write datapoint value');
    }
  }
}

