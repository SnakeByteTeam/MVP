import { Injectable, Inject } from '@nestjs/common';
import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';
import { FindDeviceByPlantIdPort } from 'src/device/application/ports/out/find-device-by-plantid.port';
import {
  DEVICE_MAPPER_REPO_PORT,
  DeviceMapperRepoPort,
} from 'src/device/application/repository/device-mapper.repository';
import {
  type FindDeviceByPlantIdRepoPort,
  FIND_DEVICE_BY_PLANTID_REPO_PORT,
} from 'src/device/application/repository/find-device-by-plantId.repository';
import { Device } from 'src/device/domain/models/device.model';
import { DeviceEntity } from 'src/device/infrastructure/entities/device.entity';

@Injectable()
export class FindDeviceByPlantIdAdapter implements FindDeviceByPlantIdPort {
  constructor(
    @Inject(DEVICE_MAPPER_REPO_PORT)
    private readonly mapper: DeviceMapperRepoPort,
    @Inject(FIND_DEVICE_BY_PLANTID_REPO_PORT)
    private readonly findDeviceRepo: FindDeviceByPlantIdRepoPort,
  ) {}

  async findByPlantId(cmd: FindDeviceByPlantIdCmd): Promise<Device[]> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    const deviceEntities: DeviceEntity[] | null =
      await this.findDeviceRepo.findByPlantId(plantId);

    if (!deviceEntities) throw new Error(`Plant ${plantId} not found`);

    const devices: Device[] = deviceEntities.map((entity) =>
      this.mapper.toDomain(entity),
    );
    return devices;
  }
}
