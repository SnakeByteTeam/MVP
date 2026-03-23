import { Device } from "src/device/domain/models/device.model";
import { FindDeviceByPlantIdCmd } from "../../commands/find-device-by-plantid.command";

export interface FindDeviceByPlantIdUseCase {
    findByPlantId(cmd: FindDeviceByPlantIdCmd): Promise<Device[]>;
}

export const FIND_DEVICE_BY_PLANTID_USECASE = Symbol('FindDeviceByPlantIdUseCase');