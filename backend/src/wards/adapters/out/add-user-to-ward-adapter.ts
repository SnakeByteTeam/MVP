import { Inject } from '@nestjs/common';
import { AddUserToWardCmd } from '../../application/commands/add-user-to-ward-cmd';
import { AddUserToWardPort } from '../../application/ports/out/add-user-to-ward-port.interface';
import {
  ADD_USER_TO_WARD_REPOSITORY,
  AddUserToWardRepository,
} from '../../application/repository/add-user-to-ward-repository.interface';
import { UserEntity } from '../../infrastructure/entities/user-entity';
import { User } from '../../domain/user';

export class AddUserToWardAdapter implements AddUserToWardPort {
  constructor(
    @Inject(ADD_USER_TO_WARD_REPOSITORY)
    private readonly addUserToWardRepository: AddUserToWardRepository,
  ) {}

  async addUserToWard(req: AddUserToWardCmd): Promise<User> {
    const userEntity: UserEntity =
      await this.addUserToWardRepository.addUserToWard(req.wardId, req.userId);

    return new User(userEntity.id, userEntity.username);
  }
}

export const ADD_USER_TO_WARD_PORT = 'ADD_USER_TO_WARD_PORT';
