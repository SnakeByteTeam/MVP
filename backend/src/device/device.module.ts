import { Module } from '@nestjs/common';
import { DeviceController } from './adapters/in/device.controller';
import { HttpModule } from '@nestjs/axios';
import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';

import { FIND_DEVICE_BY_ID_USECASE } from './application/ports/in/find-device-by-id.usecase';
import { FIND_DEVICE_BY_PLANTID_USECASE } from './application/ports/in/find-device-by-plantid.usecase';
import { FIND_DEVICE_BY_ID_PORT } from './application/ports/out/find-device-by-id.port';
import { FIND_DEVICE_BY_PLANTID_PORT } from './application/ports/out/find-device-by-plantid.port';
import { FIND_DEVICE_BY_PLANT_ID_REPO_PORT } from './application/repository/find-device-by-plant-id.repository';
import { INGEST_TIMESERIES_USE_CASE } from './application/ports/in/ingest-timeseris.usecase';
import { INGEST_TIMESERIES_PORT } from './application/ports/out/ingest-timeseries.port';
import { FIND_DEVICE_BY_ID_REPO_PORT } from './application/repository/find-device-by-id.repository';
import { INGEST_TIMESERIES_REPO_PORT } from './application/repository/ingest-timeseries.repository';
import { GET_DEVICE_VALUE_REPO_PORT } from './application/repository/get-device-value.repository';
import { GET_DEVICE_VALUE_USECASE } from './application/ports/in/get-device-value.usecase';
import { GET_DEVICE_VALUE_PORT } from './application/ports/out/get-device-value.port';
import { WRITE_DATAPOINT_VALUE_USECASE } from './application/ports/in/write-datapoint-value.usecase';
import { WRITE_DATAPOINT_VALUE_PORT } from './application/ports/out/write-device-value.port';
import { WRITE_DATAPOINT_VALUE_REPO_PORT } from './application/repository/write-datapoint-value.repo';

import { IngestTimeseriesAdapter } from './adapters/out/ingest-timeseries.adapter';
import { FindDeviceByIdAdapter } from './adapters/out/find-device-by-id.adapter';
import { DeviceService } from './application/services/device.service';
import { FindDeviceByPlantIdAdapter } from './adapters/out/find-device-by-plantId.adapter';
import { DeviceRepositoryImpl } from './infrastructure/persistence/device-repository-impl';
import { GetDeviceValueAdapter } from './adapters/out/get-device-value.adapter';
import { DeviceApiImpl } from './infrastructure/http/device-api-impl';
import { WriteDatapointValueAdapter } from './adapters/out/write-datapoint-value.adapter';


@Module({
  imports: [HttpModule, ApiAuthVimarModule],
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
    { provide: GET_DEVICE_VALUE_USECASE, useClass: DeviceService },
    { provide: GET_DEVICE_VALUE_PORT, useClass: GetDeviceValueAdapter },
    { provide: GET_DEVICE_VALUE_REPO_PORT, useClass: DeviceApiImpl }, 
    { provide: WRITE_DATAPOINT_VALUE_USECASE, useClass: DeviceService }, 
    { provide: WRITE_DATAPOINT_VALUE_PORT, useClass: WriteDatapointValueAdapter },
    { provide: WRITE_DATAPOINT_VALUE_REPO_PORT, useClass: DeviceApiImpl }
  ],
})
export class DeviceModule {}
