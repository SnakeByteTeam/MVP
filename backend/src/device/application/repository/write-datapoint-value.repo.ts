export interface WriteDatapointValueRepoPort {
    writeDeviceValue(validToken: string, plantId: string, datapointId: string, value: string): Promise<boolean>;
}

export const WRITE_DATAPOINT_VALUE_REPO_PORT = Symbol('WriteDatapointValueRepoPort')