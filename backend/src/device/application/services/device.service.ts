import { Inject, Injectable } from '@nestjs/common';

import { Device } from 'src/device/domain/models/device.model';
import { FindDeviceByIdCmd } from '../commands/find-device-by-id.command';
import { FindDeviceByIdUseCase } from '../ports/in/find-device-by-id.usecase';
import { FindDeviceByPlantIdUseCase } from '../ports/in/find-device-by-plantid.usecase';
import { FindDeviceByPlantIdCmd } from '../commands/find-device-by-plantid.command';
import {
  FIND_DEVICE_BY_ID_PORT,
  type FindDeviceByIdPort,
} from '../ports/out/find-device-by-id.port';
import {
  FIND_DEVICE_BY_PLANTID_PORT,
  type FindDeviceByPlantIdPort,
} from '../ports/out/find-device-by-plantid.port';
import { IngestTimeseriesUseCase } from '../ports/in/ingest-timeseris.usecase';
import { IngestTimeseriesCmd } from '../commands/ingest-timeseries.command';
import {
  INGEST_TIMESERIES_PORT,
  type IngestTimeseriesPort,
} from '../ports/out/ingest-timeseries.port';
import { GetDeviceValueUseCase } from '../ports/in/get-device-value.usecase';
import { DeviceValue } from 'src/device/domain/models/device-value.model';
import { GetDeviceValueCmd } from '../commands/get-device-value.command';
import {
  GET_DEVICE_VALUE_PORT,
  GetDeviceValuePort,
} from '../ports/out/get-device-value.port';
import { WriteDatapointValueUseCase } from '../ports/in/write-datapoint-value.usecase';
import { WriteDatapointValueCmd } from '../commands/write-datapoint-value.command';
import { WRITE_DATAPOINT_VALUE_PORT, type WriteDatapointValuePort } from '../ports/out/write-device-value.port';
import { FIND_DEVICE_BY_DATAPOINTID_PORT, type FindDeviceByDatapointIdPort } from '../ports/out/find-device-by-datapointId';

@Injectable()
export class DeviceService
  implements
    FindDeviceByIdUseCase,
    FindDeviceByPlantIdUseCase,
    IngestTimeseriesUseCase,
    GetDeviceValueUseCase,
    WriteDatapointValueUseCase
{
  constructor(
    @Inject(FIND_DEVICE_BY_ID_PORT)
    private readonly findByIdPort: FindDeviceByIdPort,
    @Inject(FIND_DEVICE_BY_PLANTID_PORT)
    private readonly findByPlantIdPort: FindDeviceByPlantIdPort,
    @Inject(INGEST_TIMESERIES_PORT)
    private readonly ingestTimeseriesPort: IngestTimeseriesPort,
    @Inject(GET_DEVICE_VALUE_PORT)
    private readonly getDeviceValuePort: GetDeviceValuePort,
    @Inject(WRITE_DATAPOINT_VALUE_PORT)
    private readonly writeDatapointPort: WriteDatapointValuePort,
    @Inject(FIND_DEVICE_BY_DATAPOINTID_PORT)
    private readonly findByDatapointIdPort: FindDeviceByDatapointIdPort
  ) {}

  async findById(cmd: FindDeviceByIdCmd): Promise<Device> {
    return await this.findByIdPort.findById(cmd);
  }

  async findByPlantId(cmd: FindDeviceByPlantIdCmd): Promise<Device[]> {
    return await this.findByPlantIdPort.findByPlantId(cmd);
  }

  async ingestTimeseries(cmd: IngestTimeseriesCmd): Promise<void> {
    return await this.ingestTimeseriesPort.ingestTimeseries(cmd);
  }

  async getDeviceValue(cmd: GetDeviceValueCmd): Promise<DeviceValue> {
    if (!cmd.deviceId)
      throw new Error('[Device Controller] Device id is missing');

    const device = await this.findByIdPort.findById({ id: cmd.deviceId });

    const newCmd: GetDeviceValueCmd = {
      deviceId: cmd.deviceId,
      plantId: device.getPlantId(),
    };

    return await this.getDeviceValuePort.getDeviceValue(newCmd);
  }

  async writeDatapointValue(cmd: WriteDatapointValueCmd): Promise<void> {

    const plantId: string = (await this.findByDatapointIdPort.findByDatapointId({datapointId: cmd.datapointId})).getPlantId();

    cmd.plantId = plantId;
    await this.writeDatapointPort.writeDatapointValue(cmd);
  }
}
