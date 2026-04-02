import { WriteDatapointValueCmd } from "../../commands/write-datapoint-value.command";

export interface WriteDatapointValueUseCase {
    writeDatapointValue(cmd: WriteDatapointValueCmd): Promise<void>;
}

export const WRITE_DATAPOINT_VALUE_USECASE = Symbol('WriteDatapointValueUseCase')