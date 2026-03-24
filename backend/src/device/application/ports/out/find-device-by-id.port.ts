import { Device } from "src/device/domain/models/device.model";
import { FindDeviceByIdCmd } from "../../commands/find-device-by-id.command";

export interface FindDeviceByIdPort {
    findById(cmd: FindDeviceByIdCmd): Promise<Device>
}

export const FIND_DEVICE_BY_ID_PORT = Symbol('FindDeviceByIdPort');