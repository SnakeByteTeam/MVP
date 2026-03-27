import { Injectable, Inject } from '@nestjs/common';
import {
  UPDATE_CACHE_USE_CASE,
  type UpdateCacheUseCase,
} from 'src/cache/application/ports/in/get-valid-cache.usecase';

import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';
import { FindDeviceByIdPort } from 'src/device/application/ports/out/find-device-by-id.port';
import {
  FIND_DEVICE_BY_ID_REPO_PORT,
  type FindDeviceByIdRepoPort,
} from 'src/device/application/repository/find-device-by-id.repository';
import { Device } from 'src/device/domain/models/device.model';
import { DeviceEntity } from 'src/device/infrastructure/persistence/entities/device.entity';
import { Plant } from 'src/plant/domain/models/plant.model';

@Injectable()
export class FindDeviceByIdAdapter implements FindDeviceByIdPort {
  constructor(
    @Inject(FIND_DEVICE_BY_ID_REPO_PORT)
    private readonly repo: FindDeviceByIdRepoPort,
  ) {}

  async findById(cmd: FindDeviceByIdCmd): Promise<Device> {
    if (!cmd?.id) throw new Error('[FindDeviceByIdAdapter] Id is empty');

    const deviceEntity: DeviceEntity | null = await this.repo.findById(cmd.id);
    if (!deviceEntity)
      throw new Error("[FindDeviceByIdAdapter] Can't find device on db");

    return DeviceEntity.toDomain(deviceEntity);
  }
}
