import { WriteDatapointValueCmd } from "../../commands/write-datapoint-value.command";

export interface WriteDatapointValuePort {
    writeDatapointValue(cmd: WriteDatapointValueCmd): Promise<void>
}

export const WRITE_DATAPOINT_VALUE_PORT = Symbol('WriteDatapointValuePort')