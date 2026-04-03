import { Inject } from '@nestjs/common';
import { RemovePlantFromWardCmd } from '../../application/commands/remove-plant-from-ward-cmd';
import { RemovePlantFromWardPort } from '../../application/ports/out/remove-plant-from-ward-port.interface';
import {
  REMOVE_PLANT_FROM_WARD_REPOSITORY,
  RemovePlantFromWardRepository,
} from '../../application/repository/remove-plant-from-ward-repository.interface';

export class RemovePlantFromWardAdapter implements RemovePlantFromWardPort {
  constructor(
    @Inject(REMOVE_PLANT_FROM_WARD_REPOSITORY)
    private readonly removePlantFromWardRepository: RemovePlantFromWardRepository,
  ) {}

  async removePlantFromWard(req: RemovePlantFromWardCmd): Promise<void> {
    return await this.removePlantFromWardRepository.removePlantFromWard(
      req.plantId,
    );
  }
}

export const REMOVE_PLANT_FROM_WARD_PORT = 'REMOVE_PLANT_FROM_WARD_PORT';
