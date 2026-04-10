import { Injectable } from '@nestjs/common';
import { delay, firstValueFrom, retry } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  DatapointApiResponse,
  DatapointExtractedDto,
} from './dtos/in/datapoint-response.dto';
import { WriteDatapointValueRequestDto } from './dtos/out/write-datapoint-value-request.dto';

@Injectable()
export class DeviceApiImpl {
  constructor(private readonly httpService: HttpService) {}

  private readonly API_DOMAIN = process.env.HOST3 || '';

  async getDeviceValue(
    validToken: string,
    plantId: string,
    deviceId: string,
  ): Promise<DatapointExtractedDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<DatapointApiResponse>(
          `${this.API_DOMAIN}/${plantId}/functions/${deviceId}/datapoints`,
          {
            headers: { Authorization: `Bearer ${validToken}` },
          },
        ),
      );

      const extracted: DatapointExtractedDto[] =
        DatapointExtractedDto.fromApiResponses(response.data);
      return extracted;
    } catch {
      throw new Error(`[DEVICE API IMPL] Error requesting ${deviceId} value`);
    }
  }

  async writeDeviceValue(
    validToken: string,
    plantId: string,
    datapointId: string,
    value: string,
  ): Promise<boolean> {
    try {
      const data = WriteDatapointValueRequestDto.fromDatapoint(
        datapointId,
        value,
      );

      const response = await firstValueFrom(
        this.httpService.put(
          `${this.API_DOMAIN}/${plantId}/datapoints/values/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${validToken}`,
              'Content-Type': 'application/vnd.api+json',
              accept: 'application/vnd.api+json',
            },
          },
        ),
      );

      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
