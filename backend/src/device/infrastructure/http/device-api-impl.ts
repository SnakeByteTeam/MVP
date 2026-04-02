import { Injectable } from '@nestjs/common';
import { GetDeviceValueRepoPort } from 'src/device/application/repository/get-device-value.repository';
import { delay, firstValueFrom, retry } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  DatapointApiResponse,
  DatapointExtractedDto,
} from './dtos/in/datapoint-response.dto';

@Injectable()
export class DeviceApiImpl implements GetDeviceValueRepoPort {
  constructor(private readonly httpService: HttpService) {}

  private readonly API_DOMAIN = process.env.HOST3 || '';

  async getDeviceValue(
    validToken: string,
    plantId: string,
    deviceId: string,
  ): Promise<DatapointExtractedDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<DatapointApiResponse>(
            `${this.API_DOMAIN}/${plantId}/functions/${deviceId}/datapoints`,
            {
              headers: { Authorization: `Bearer ${validToken}` },
              timeout: 10000,
            },
          )
          .pipe(retry({ count: 3, delay: 1000 })),
      );

      const extracted: DatapointExtractedDto[] =
        DatapointExtractedDto.fromApiResponses(response.data);
      return extracted;
    } catch {
      throw new Error(`[DEVICE API IMPL] Error requesting ${deviceId} value`);
    }
  }
}


