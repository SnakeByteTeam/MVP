import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, retry } from 'rxjs';

import { DeviceDto } from 'src/device/infrastructure/http/dtos/out/device.dto';
import { DatapointDto } from 'src/device/infrastructure/http/dtos/out/datapoint.dto';
import { plainToInstance } from 'class-transformer';
import { ApiRoomDto, ApiPlantResponseDto } from './dtos/in/api-plant.dto';
import { DeviceResponseDto, ApiDeviceDto } from './dtos/in/api-device.dto';
import {
  DatapointResponseDto,
  ApiDatapointDto,
} from './dtos/in/api-datapoint.dto';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';
import { RoomDto } from 'src/plant/infrastructure/http/dtos/room.dto';
import { PlantSeekResponseDto } from './dtos/in/plant-seek.dto';

@Injectable()
export class FetchStructureCacheImpl {
  private readonly API_DOMAIN = process.env.HOST3 || '';

  constructor(private readonly httpService: HttpService) {}

  async fetch(validToken: string, plantId: string): Promise<PlantDto | null> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.API_DOMAIN}/${plantId}/locations`, {
            headers: { Authorization: `Bearer ${validToken}` },
            timeout: 10000,
          })
          .pipe(retry({ count: 3, delay: 1000 })),
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

      const roomsToFetch = apiResponse.data.filter((room: ApiRoomDto) =>
        room.meta.type.includes('loc:Location'),
      );

      plantdto.rooms = await Promise.all(
        roomsToFetch.map(
          async (room: ApiRoomDto) =>
            await this.fetchRoom(validToken, plantId, room),
        ),
      );

      return plantdto;
    } catch (error) {
      console.error(
        `[FetchStructureCacheImpl] Error fetching plant structure for ${plantId}:`,
        error.message,
      );
      return null;
    }
  }

  async getAllPlantIds(validToken: string): Promise<string[]> {
    const PLANT_DOMAIN: string = process.env.PLANT_DOMAIN || '';

    const response = await firstValueFrom(
      this.httpService.get<PlantSeekResponseDto>(PLANT_DOMAIN, {
        headers: { Authorization: `Bearer ${validToken}` },
      }),
    );

    return response.data.api.templates.plantId.values;
  }

  private async fetchRoom(
    validToken: string,
    plantId: string,
    room: ApiRoomDto,
  ): Promise<RoomDto> {
    const response = await firstValueFrom(
      this.httpService
        .get(`${this.API_DOMAIN}/${plantId}/locations/${room.id}/functions`, {
          headers: { Authorization: `Bearer ${validToken}` },
          timeout: 10000,
        })
        .pipe(retry({ count: 3, delay: 1000 })),
    );

    if (!response.data)
      throw new Error(`Failed to fetch devices for room ${room.id}`);

    const deviceResponse = plainToInstance(DeviceResponseDto, response.data, {
      excludeExtraneousValues: true,
    });

    const roomdto: RoomDto = new RoomDto();

    roomdto.id = room.id;
    roomdto.name = room.attributes.title;

    const deviceToFetch: ApiDeviceDto[] = deviceResponse.data;

    roomdto.devices = await Promise.all(
      deviceToFetch.map(
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
      this.httpService
        .get(
          `${this.API_DOMAIN}/${plantId}/functions/${device.id}/datapoints`,
          {
            headers: { Authorization: `Bearer ${validToken}` },
            timeout: 10000,
          },
        )
        .pipe(retry({ count: 3, delay: 1000 })),
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

    const datapointTofetch: ApiDatapointDto[] = datapointReponse.data;

    devicedto.datapoints = datapointTofetch.map((dp: ApiDatapointDto) =>
      this.fetchDatapoint(dp),
    );

    return devicedto;
  }

  private fetchDatapoint(datapoint: ApiDatapointDto): DatapointDto {
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
