import { Injectable, Inject } from '@nestjs/common';

import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';
import { FindDeviceByPlantIdPort } from 'src/device/application/ports/out/find-device-by-plantid.port';
import {
  FIND_DEVICE_BY_PLANT_ID_REPO_PORT,
  type FindDeviceByPlantIdRepoPort,
} from 'src/device/application/repository/find-device-by-plant-id.repository';

import { Device } from 'src/device/domain/models/device.model';
import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';

@Injectable()
export class FindDeviceByPlantIdAdapter implements FindDeviceByPlantIdPort {
  constructor(
    @Inject(FIND_DEVICE_BY_PLANT_ID_REPO_PORT)
    private readonly repo: FindDeviceByPlantIdRepoPort,
  ) {}

  async findByPlantId(cmd: FindDeviceByPlantIdCmd): Promise<Device[]> {
    if (!cmd?.id)
      throw new Error('[FindDeviceByPlantIdAdapter] PlantId is empty');

    const deviceEntity: DeviceEntity[] | null = await this.repo.findByPlantId(
      cmd.id,
    );
    if (!deviceEntity)
      throw new Error(
        `[FindDeviceByPlantIdAdapter] Can't find the devices of plant ${cmd.id}`,
      );

    return deviceEntity.map((entity) => DeviceEntity.toDomain(entity));
  }
}
