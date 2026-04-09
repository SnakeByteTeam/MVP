import { DatapointExtractedDto } from 'src/device/infrastructure/http/dtos/in/datapoint-response.dto';

export interface GetDeviceValueRepoPort {
  getDeviceValue(
    validToken: string,
    plantId: string,
    deviceId: string,
  ): Promise<DatapointExtractedDto[]>;
}

export const GET_DEVICE_VALUE_REPO_PORT = Symbol('GetDeviceValueRepoPort');
