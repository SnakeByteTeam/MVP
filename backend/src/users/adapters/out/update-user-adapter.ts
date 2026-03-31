import { Inject } from '@nestjs/common';
import { UpdateUserCmd } from '../../application/commands/update-user-cmd';
import { UpdateUserPort } from '../../application/ports/out/update-user-port.interface';
import { User } from '../../domain/user';
import {
  UPDATE_USER_REPOSITORY,
  UpdateUserRepository,
} from '../../application/repository/update-user-repository.interface';
import { UserEntity } from '../../infrastructure/entities/user-entity';

export class UpdateUserAdapter implements UpdateUserPort {
  constructor(
    @Inject(UPDATE_USER_REPOSITORY)
    private readonly updateUserRepository: UpdateUserRepository,
  ) {}

  async updateUser(req: UpdateUserCmd): Promise<User> {
    const res: UserEntity = await this.updateUserRepository.updateUser(
      req.id,
      req.username,
      req.surname,
      req.name,
    );

    return new User(res.id, res.username, res.surname, res.name, res.role);
  }
}

export const UPDATE_USER_PORT = 'UPDATE_USER_PORT';
