import { Device } from "src/device/domain/models/device.model";
import { DeviceEntity } from "src/device/infrastructure/entities/device.entity";

export interface DeviceMapperRepoPort {
    toDomain(entity: DeviceEntity): Device;
}

export const DEVICE_MAPPER_REPO_PORT = Symbol('DeviceMapperRepoPort')