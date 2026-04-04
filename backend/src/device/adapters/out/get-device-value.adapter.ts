import { Inject, Injectable } from '@nestjs/common';
import {
  GETVALIDTOKENPORT,
  type GetValidTokenPort,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import { GetDeviceValueCmd } from 'src/device/application/commands/get-device-value.command';
import { GetDeviceValuePort } from 'src/device/application/ports/out/get-device-value.port';
import {
  GET_DEVICE_VALUE_REPO_PORT,
  type GetDeviceValueRepoPort,
} from 'src/device/application/repository/get-device-value.repository';
import {
  DatapointValue,
  DeviceValue,
} from 'src/device/domain/models/device-value.model';
import {
  DatapointApiResponse,
  DatapointExtractedDto,
} from 'src/device/infrastructure/http/dtos/in/datapoint-response.dto';
import { DeviceValueDto } from 'src/device/infrastructure/http/dtos/out/device-value.dto';

@Injectable()
export class GetDeviceValueAdapter implements GetDeviceValuePort {
  constructor(
    @Inject(GET_DEVICE_VALUE_REPO_PORT)
    private readonly repoPort: GetDeviceValueRepoPort,
    @Inject(GETVALIDTOKENPORT)
    private readonly tokenPort: GetValidTokenPort,
  ) {}

  async getDeviceValue(cmd: GetDeviceValueCmd): Promise<DeviceValue> {
    if (!cmd.deviceId || !cmd.plantId)
      throw new Error('[GET DEVICE VALUE ADAPTER] Some parameters are null');

    const token: string | null = await this.tokenPort.getValidToken();
    if (!token) throw new Error('[GET DEVICE VALUE ADAPTER] Token is null');

    const entity: DatapointExtractedDto[] = await this.repoPort.getDeviceValue(
      token,
      cmd.plantId,
      cmd.deviceId,
    );

    const datapointValues: DatapointValue[] = entity.map((dp) =>
      DatapointExtractedDto.toDomain(dp),
    );
    return new DeviceValue(cmd.deviceId, datapointValues);
  }
}
