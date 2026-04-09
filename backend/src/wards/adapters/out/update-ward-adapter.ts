import { Inject } from '@nestjs/common';
import { UpdateWardCmd } from '../../application/commands/update-ward-cmd';
import { UpdateWardPort } from '../../application/ports/out/update-ward-port.interface';
import { Ward } from '../../domain/ward';
import {
  UPDATE_WARD_REPOSITORY,
  UpdateWardRepository,
} from '../../application/repository/update-ward-repository.interface';
import { WardEntity } from '../../infrastructure/entities/ward-entity';

export class UpdateWardAdapter implements UpdateWardPort {
  constructor(
    @Inject(UPDATE_WARD_REPOSITORY)
    private readonly updateWardRepository: UpdateWardRepository,
  ) {}

  async updateWard(req: UpdateWardCmd): Promise<Ward> {
    const res: WardEntity = await this.updateWardRepository.updateWard(
      req.id,
      req.name,
    );

    return new Ward(res.id, res.name);
  }
}

export const UPDATE_WARD_PORT = 'UPDATE_WARD_PORT';
