import { Module } from '@nestjs/common';
import { DeviceController } from './adapters/in/device.controller';

import { FIND_DEVICE_BY_ID_USECASE } from './application/ports/in/find-device-by-id.usecase';
import { FIND_DEVICE_BY_PLANTID_USECASE } from './application/ports/in/find-device-by-plantid.usecase';
import { FIND_DEVICE_BY_ID_PORT } from './application/ports/out/find-device-by-id.port';
import { FIND_DEVICE_BY_PLANTID_PORT } from './application/ports/out/find-device-by-plantid.port';
import { IngestTimeseriesAdapter } from './adapters/out/ingest-timeseries.adapter';
import { FIND_DEVICE_BY_PLANT_ID_REPO_PORT } from './application/repository/find-device-by-plant-id.repository';
import { INGEST_TIMESERIES_USE_CASE } from './application/ports/in/ingest-timeseris.usecase';
import { INGEST_TIMESERIES_PORT } from './application/ports/out/ingest-timeseries.port';
import { FIND_DEVICE_BY_ID_REPO_PORT } from './application/repository/find-device-by-id.repository';
import { INGEST_TIMESERIES_REPO_PORT } from './application/repository/ingest-timeseries.repository';

import { FindDeviceByIdAdapter } from './adapters/out/find-device-by-id.adapter';
import { DeviceService } from './application/services/device.service';
import { FindDeviceByPlantIdAdapter } from './adapters/out/find-device-by-plantId.adapter';
import { DeviceRepositoryImpl } from './infrastructure/persistence/device-repository-impl';

@Module({
  imports: [],
  controllers: [DeviceController],
  providers: [
    { provide: FIND_DEVICE_BY_ID_USECASE, useClass: DeviceService },
    { provide: FIND_DEVICE_BY_PLANTID_USECASE, useClass: DeviceService },
    { provide: FIND_DEVICE_BY_ID_PORT, useClass: FindDeviceByIdAdapter },
    {
      provide: FIND_DEVICE_BY_PLANTID_PORT,
      useClass: FindDeviceByPlantIdAdapter,
    },
    { provide: FIND_DEVICE_BY_ID_REPO_PORT, useClass: DeviceRepositoryImpl },
    {
      provide: FIND_DEVICE_BY_PLANT_ID_REPO_PORT,
      useClass: DeviceRepositoryImpl,
    },
    { provide: INGEST_TIMESERIES_USE_CASE, useClass: DeviceService },
    { provide: INGEST_TIMESERIES_PORT, useClass: IngestTimeseriesAdapter },
    { provide: INGEST_TIMESERIES_REPO_PORT, useClass: DeviceRepositoryImpl },
  ],
})
export class DeviceModule {}
