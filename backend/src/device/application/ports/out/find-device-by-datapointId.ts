import { Device } from "src/device/domain/models/device.model";
import { FindDeviceByDatapointIdCmd } from "../../commands/find-device-by-datapointId.command";

export interface FindDeviceByDatapointIdPort {
    findByDatapointId(cmd: FindDeviceByDatapointIdCmd): Promise<Device>;
}

export const FIND_DEVICE_BY_DATAPOINTID_PORT = Symbol('FindDeviceByDatapointIdPort')