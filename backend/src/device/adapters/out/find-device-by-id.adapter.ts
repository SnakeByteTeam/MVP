import { Injectable, Inject } from '@nestjs/common';
import { GET_VALID_CACHE_PORT, type GetValidCachePort } from 'src/cache/application/ports/out/get-valid-cache.port';

import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';
import { FindDeviceByIdPort } from 'src/device/application/ports/out/find-device-by-id.port';
import { Device } from 'src/device/domain/models/device.model';
import { Plant } from 'src/plant/domain/models/plant.model';


@Injectable()
export class FindDeviceByIdAdapter implements FindDeviceByIdPort {
  constructor(
    @Inject(GET_VALID_CACHE_PORT)
    private readonly getValidCachePort: GetValidCachePort,
   
  ) {}

  async findById(cmd: FindDeviceByIdCmd): Promise<Device> {
    const plantId: string = cmd?.plantId;
    if (!plantId) throw new Error('PlantId is null');

    const plant: Plant = await this.getValidCachePort.getValidCache({ plantId: plantId });
    if(!plant) throw new Error(`Plant ${plantId} not found`);

    const deviceId: string = cmd?.id;
    if (!deviceId) throw new Error('DeviceId is null');
    
    const device: Device | null = plant.getRooms()
      .flatMap((room) => room.getDevices())
      .find((device) => device.getId() === deviceId) || null;

    if (!device) throw new Error(`Device ${deviceId} not found`);

    return device;
  }
}
