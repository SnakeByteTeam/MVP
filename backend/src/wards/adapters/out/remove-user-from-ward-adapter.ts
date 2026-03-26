import { Inject } from '@nestjs/common';
import { RemoveUserFromWardCmd } from '../../application/commands/remove-user-from-ward-cmd';
import { RemoveUserFromWardPort } from '../../application/ports/out/remove-user-from-ward-port.interface';
import { REMOVE_USER_FROM_WARD_REPOSITORY, RemoveUserFromWardRepository } from '../../application/repository/remove-user-from-ward-repository.interface';

export class RemoveUserFromWardAdapter implements RemoveUserFromWardPort {

  constructor(
    @Inject(REMOVE_USER_FROM_WARD_REPOSITORY)
    private readonly removeUserFromWardRepository: RemoveUserFromWardRepository,
  ) {}

  async removeUserFromWard(req: RemoveUserFromWardCmd): Promise<void> {
    return await this.removeUserFromWardRepository.removeUserFromWard(req.wardId, req.userId);
  }
}

export const REMOVE_USER_FROM_WARD_PORT = 'REMOVE_USER_FROM_WARD_PORT';
