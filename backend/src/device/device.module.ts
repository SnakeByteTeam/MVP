import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';
import { DeviceController } from './adapters/in/device.controller';

import { FIND_DEVICE_BY_ID_USECASE } from './application/ports/in/find-device-by-id.usecase';
import { FIND_DEVICE_BY_PLANTID_USECASE } from './application/ports/in/find-device-by-plantid.usecase';
import { FIND_DEVICE_BY_ID_PORT } from './application/ports/out/find-device-by-id.port';
import { FIND_DEVICE_BY_PLANTID_PORT } from './application/ports/out/find-device-by-plantid.port';
import { FIND_DEVICE_BY_PLANTID_REPO_PORT } from './application/repository/find-device-by-plantId.repository';
import { FIND_DEVICE_BY_ID_REPO_PORT } from './application/repository/find-device-by-id.repository';
import { DEVICE_MAPPER_REPO_PORT } from './application/repository/device-mapper.repository';

import { FindDeviceByIdAdapter } from './adapters/out/find-device-by-id.adapter';
import { DeviceService } from './application/services/device.service';
import { FindDeviceByPlantIdAdapter } from './adapters/out/find-device-by-plantId.adapter';
import { DeviceRepositoryImpl } from './infrastructure/persistence/device-repository-impl';
import { DeviceMapper } from './infrastructure/mappers/device-mapper';


@Module({
    imports: [TokensModule], 
    controllers: [DeviceController], 
    providers: [
        {provide: FIND_DEVICE_BY_ID_USECASE,          useClass: DeviceService}, 
        {provide: FIND_DEVICE_BY_PLANTID_USECASE,     useClass: DeviceService}, 
        {provide: FIND_DEVICE_BY_ID_PORT,             useClass: FindDeviceByIdAdapter}, 
        {provide: FIND_DEVICE_BY_PLANTID_PORT,        useClass: FindDeviceByPlantIdAdapter}, 
        {provide: FIND_DEVICE_BY_ID_REPO_PORT,        useClass: DeviceRepositoryImpl}, 
        {provide: FIND_DEVICE_BY_PLANTID_REPO_PORT,   useClass: DeviceRepositoryImpl}, 
        {provide: DEVICE_MAPPER_REPO_PORT,            useClass: DeviceMapper}
    ]
})
export class DeviceModule {}
