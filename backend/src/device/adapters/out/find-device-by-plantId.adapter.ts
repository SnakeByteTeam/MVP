import { Injectable, Inject } from '@nestjs/common';
import { GET_VALID_CACHE_PORT, GetValidCachePort } from 'src/cache/application/ports/out/get-valid-cache.port';
import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';
import { FindDeviceByPlantIdPort } from 'src/device/application/ports/out/find-device-by-plantid.port';

import { Device } from 'src/device/domain/models/device.model';
import { Plant } from 'src/plant/domain/models/plant.model';


@Injectable()
export class FindDeviceByPlantIdAdapter implements FindDeviceByPlantIdPort {
  constructor(
    @Inject(GET_VALID_CACHE_PORT)
    private readonly getValidCachePort: GetValidCachePort,
  ) {}

  async findByPlantId(cmd: FindDeviceByPlantIdCmd): Promise<Device[]> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    console.log(`[FindDeviceByPlantIdAdapter] Finding devices for plantId: ${plantId}`);

    const plant: Plant = await this.getValidCachePort.getValidCache({ plantId: plantId });
    console.log(`[FindDeviceByPlantIdAdapter] Got plant:`, plant ? 'found' : 'not found');
    
    if(!plant) throw new Error(`Plant ${plantId} not found`);

    const devices: Device[] = plant.getRooms()
      .flatMap((room) => room.getDevices())
      .map((device) => device);
    
    console.log(`[FindDeviceByPlantIdAdapter] Returning ${devices.length} devices`);
    return devices;
  }
}
