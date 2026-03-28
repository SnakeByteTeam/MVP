import { Module } from '@nestjs/common';
import { DeviceController } from './adapters/in/device.controller';

import { FIND_DEVICE_BY_ID_USECASE } from './application/ports/in/find-device-by-id.usecase';
import { FIND_DEVICE_BY_PLANTID_USECASE } from './application/ports/in/find-device-by-plantid.usecase';
import { FIND_DEVICE_BY_ID_PORT } from './application/ports/out/find-device-by-id.port';
import { FIND_DEVICE_BY_PLANTID_PORT } from './application/ports/out/find-device-by-plantid.port';

import { FindDeviceByIdAdapter } from './adapters/out/find-device-by-id.adapter';
import { DeviceService } from './application/services/device.service';
import { FindDeviceByPlantIdAdapter } from './adapters/out/find-device-by-plantId.adapter';
import { FIND_DEVICE_BY_ID_REPO_PORT } from './application/repository/find-device-by-id.repository';
import { DeviceRepositoryImpl } from './infrastructure/persistence/device-repository-impl';
import { FIND_DEVICE_BY_PLANT_ID_REPO_PORT } from './application/repository/find-device-by-plant-id.repository';

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
  ],
})
export class DeviceModule {}
