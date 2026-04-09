import { Module } from '@nestjs/common';
import { DeviceController } from './adapters/in/device.controller';
import { HttpModule } from '@nestjs/axios';
import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';
import { AlarmsModule } from 'src/alarms/alarms.module';

import { FIND_DEVICE_BY_ID_USECASE } from './application/ports/in/find-device-by-id.usecase';
import { FIND_DEVICE_BY_PLANTID_USECASE } from './application/ports/in/find-device-by-plantid.usecase';
import { FIND_DEVICE_BY_ID_PORT } from './application/ports/out/find-device-by-id.port';
import { FIND_DEVICE_BY_PLANTID_PORT } from './application/ports/out/find-device-by-plantid.port';
import { INGEST_TIMESERIES_USE_CASE } from './application/ports/in/ingest-timeseris.usecase';
import { INGEST_TIMESERIES_PORT } from './application/ports/out/ingest-timeseries.port';
import { GET_DEVICE_VALUE_USECASE } from './application/ports/in/get-device-value.usecase';
import { GET_DEVICE_VALUE_PORT } from './application/ports/out/get-device-value.port';
import { WRITE_DATAPOINT_VALUE_USECASE } from './application/ports/in/write-datapoint-value.usecase';
import { WRITE_DATAPOINT_VALUE_PORT } from './application/ports/out/write-device-value.port';
import { FIND_DEVICE_BY_DATAPOINTID_USECASE } from './application/ports/in/find-device-by-datapointId.usecase';
import { FIND_DEVICE_BY_DATAPOINTID_PORT } from './application/ports/out/find-device-by-datapointId';

import { DeviceAdapter } from './adapters/out/device.adapter';
import { DeviceService } from './application/services/device.service';
import { DeviceRepositoryImpl } from './infrastructure/persistence/device-repository-impl';
import { DeviceApiImpl } from './infrastructure/http/device-api-impl';
import {
  DEVICE_REPOSITORY_PORT,
  DeviceRepositoryPort,
} from './application/repository/device.repository';
import { GuardModule } from 'src/guard/guard.module';

@Module({
  imports: [HttpModule, ApiAuthVimarModule, AlarmsModule, GuardModule],
  controllers: [DeviceController],
  providers: [
    { provide: FIND_DEVICE_BY_ID_USECASE, useClass: DeviceService },
    { provide: FIND_DEVICE_BY_PLANTID_USECASE, useClass: DeviceService },
    { provide: INGEST_TIMESERIES_USE_CASE, useClass: DeviceService },
    { provide: GET_DEVICE_VALUE_USECASE, useClass: DeviceService },
    { provide: WRITE_DATAPOINT_VALUE_USECASE, useClass: DeviceService },
    { provide: FIND_DEVICE_BY_DATAPOINTID_USECASE, useClass: DeviceService },
    { provide: DEVICE_REPOSITORY_PORT, useClass: DeviceRepositoryImpl },
    { provide: FIND_DEVICE_BY_ID_PORT, useClass: DeviceAdapter },
    { provide: FIND_DEVICE_BY_PLANTID_PORT, useClass: DeviceAdapter },
    { provide: INGEST_TIMESERIES_PORT, useClass: DeviceAdapter },
    { provide: GET_DEVICE_VALUE_PORT, useClass: DeviceAdapter },
    { provide: WRITE_DATAPOINT_VALUE_PORT, useClass: DeviceAdapter },
    { provide: FIND_DEVICE_BY_DATAPOINTID_PORT, useClass: DeviceAdapter },
    DeviceRepositoryImpl,
    DeviceApiImpl,
  ],
})
export class DeviceModule {}
