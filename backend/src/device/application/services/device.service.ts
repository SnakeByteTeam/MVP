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

@Injectable()
export class DeviceService
  implements
    FindDeviceByIdUseCase,
    FindDeviceByPlantIdUseCase,
    IngestTimeseriesUseCase
{
  constructor(
    @Inject(FIND_DEVICE_BY_ID_PORT)
    private readonly findByIdPort: FindDeviceByIdPort,
    @Inject(FIND_DEVICE_BY_PLANTID_PORT)
    private readonly findByPlantIdPort: FindDeviceByPlantIdPort,
    @Inject(INGEST_TIMESERIES_PORT)
    private readonly ingestTimeseriesPort: IngestTimeseriesPort,
  ) {}

  async findById(cmd: FindDeviceByIdCmd): Promise<Device> {
    return await this.findByIdPort.findById(cmd);
  }

  async findByPlantId(cmd: FindDeviceByPlantIdCmd): Promise<Device[]> {
    return await this.findByPlantIdPort.findByPlantId(cmd);
  }

  async ingestTimeseries(cmd: IngestTimeseriesCmd): Promise<void> {
    if (!cmd?.datapointId || !cmd?.value || !cmd?.timestamp)
      throw new Error("Can't ingest timeseries without parameters");
    return await this.ingestTimeseriesPort.ingestTimeseries(cmd);
  }
}
