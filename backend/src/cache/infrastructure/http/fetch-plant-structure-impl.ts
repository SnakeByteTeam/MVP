import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { DeviceDto } from 'src/device/infrastructure/http/dtos/device.dto';
import { DatapointDto } from 'src/device/infrastructure/http/dtos/datapoint.dto';
import { plainToInstance } from 'class-transformer';
import { ApiRoomDto, ApiPlantResponseDto } from './dtos/in/api-plant.dto';
import { DeviceResponseDto, ApiDeviceDto } from './dtos/in/api-device.dto';
import {
  DatapointResponseDto,
  ApiDatapointDto,
} from './dtos/in/api-datapoint.dto';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';
import { RoomDto } from 'src/plant/infrastructure/http/dtos/room.dto';
import { FetchNewCacheRepoPort } from 'src/cache/application/repository/fetch-new-cache.repository';

@Injectable()
export class FetchStructureCacheImpl implements FetchNewCacheRepoPort {
  private readonly API_DOMAIN = process.env.HOST3 || '';

  constructor(private readonly httpService: HttpService) {}

  async fetch(validToken: string, plantId: string): Promise<PlantDto | null> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.API_DOMAIN}/${plantId}/locations`, {
        headers: { Authorization: `Bearer ${validToken}` },
      }),
    );

    if (!response.data) return null;

    const apiResponse: ApiPlantResponseDto = plainToInstance(
      ApiPlantResponseDto,
      response.data,
      { excludeExtraneousValues: true },
    );

    const plantdto = new PlantDto();
    plantdto.id = plantId;
    plantdto.name = apiResponse.data[0].attributes.title;
    plantdto.rooms = await Promise.all(
      apiResponse.data
        .filter((room: ApiRoomDto) => room.meta.type.includes('loc:Location'))
        .map(
          async (room: ApiRoomDto) =>
            await this.fetchRoom(validToken, plantId, room),
        ),
    );

    return plantdto;
  }

  private async fetchRoom(
    validToken: string,
    plantId: string,
    room: ApiRoomDto,
  ): Promise<RoomDto> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.API_DOMAIN}/${plantId}/locations/${room.id}/functions`,
        { headers: { Authorization: `Bearer ${validToken}` } },
      ),
    );

    if (!response.data)
      throw new Error(`Failed to fetch devices for room ${room.id}`);

    const deviceResponse = plainToInstance(DeviceResponseDto, response.data, {
      excludeExtraneousValues: true,
    });

    const roomdto: RoomDto = new RoomDto();

    roomdto.id = room.id;
    roomdto.name = room.attributes.title;

    roomdto.devices = await Promise.all(
      deviceResponse.data.map(
        async (device: ApiDeviceDto) =>
          await this.fetchDevice(validToken, plantId, device),
      ),
    );

    return roomdto;
  }

  private async fetchDevice(
    validToken: string,
    plantId: string,
    device: any,
  ): Promise<DeviceDto> {
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.API_DOMAIN}/${plantId}/functions/${device.id}/datapoints`,
        { headers: { Authorization: `Bearer ${validToken}` } },
      ),
    );

    if (!response.data)
      throw new Error(`Failed to fetch datapoints for device ${device.id}`);

    const datapointReponse = plainToInstance(
      DatapointResponseDto,
      response.data,
      {
        excludeExtraneousValues: true,
      },
    );

    const devicedto: DeviceDto = new DeviceDto();
    devicedto.id = device.id;
    devicedto.name = device.attributes.title;
    devicedto.plantId = plantId;
    devicedto.type = device.meta.ssType;
    devicedto.subType = device.meta.sfType;

    devicedto.datapoints = await Promise.all(
      datapointReponse.data.map(
        async (dp: ApiDatapointDto) => await this.fetchDatapoint(dp),
      ),
    );

    return devicedto;
  }

  private async fetchDatapoint(
    datapoint: ApiDatapointDto,
  ): Promise<DatapointDto> {
    const datapointdto: DatapointDto = {
      id: datapoint.id,
      name: datapoint.attributes.title,
      readable: datapoint.attributes.readable,
      writable: datapoint.attributes.writable,
      enum: datapoint.attributes.enum,
      valueType: datapoint.attributes.valueType,
      sfeType: datapoint.meta.sfeType,
    };

    return datapointdto;
  }
}
