import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";

import { FindDeviceByIdCmd } from "src/device/application/commands/find-device-by-id.command";
import { FindDeviceByIdPort } from "src/device/application/ports/out/find-device-by-id.port";
import { type DeviceMapperRepoPort, DEVICE_MAPPER_REPO_PORT } from "src/device/application/repository/device-mapper.repository";
import { type FindDeviceByIdRepoPort, FIND_DEVICE_BY_ID_REPO_PORT } from "src/device/application/repository/find-device-by-id.repository";
import { Datapoint } from "src/device/domain/models/datapoint.model";
import { Device } from "src/device/domain/models/device.model";
import { DatapointEntity } from "src/device/infrastructure/entities/datapoint.entity";
import { DeviceEntity } from "src/device/infrastructure/entities/device.entity";


@Injectable()
export class FindDeviceByIdAdapter implements FindDeviceByIdPort {

    constructor(
        @Inject(DEVICE_MAPPER_REPO_PORT) private readonly mapper: DeviceMapperRepoPort,
        @Inject(FIND_DEVICE_BY_ID_REPO_PORT) private readonly findDeviceByIdRepository: FindDeviceByIdRepoPort
    ) {}

    async findById(cmd: FindDeviceByIdCmd): Promise<Device> {
        const deviceId: string = cmd?.id;
        if(!deviceId) throw (new Error('Id is null'));

        const deviceEntity: DeviceEntity | null = await this.findDeviceByIdRepository.findById(deviceId);

        if(!deviceEntity) throw(new Error(`Device ${deviceId} not found`));
        
        const device = this.mapper.toDomain(deviceEntity);
        return device;
    }

    
}