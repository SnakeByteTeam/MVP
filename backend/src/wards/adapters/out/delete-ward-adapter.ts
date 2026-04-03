import { Inject } from '@nestjs/common';
import { DeleteWardCmd } from '../../application/commands/delete-ward-cmd';
import { DeleteWardPort } from '../../application/ports/out/delete-ward-port.interface';
import { DELETE_WARD_REPOSITORY } from '../../application/repository/delete-ward-repository.interface';

export class DeleteWardAdapter implements DeleteWardPort {
  constructor(
    @Inject(DELETE_WARD_REPOSITORY) private readonly deleteWardRepository,
  ) {}

  async deleteWard(req: DeleteWardCmd): Promise<void> {
    return await this.deleteWardRepository.deleteWard(req.id);
  }
}

export const DELETE_WARD_PORT = 'DELETE_WARD_PORT';
