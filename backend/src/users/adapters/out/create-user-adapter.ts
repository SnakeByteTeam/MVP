import { Inject } from '@nestjs/common';
import { CreateUserPort } from '../../application/ports/out/create-user-port.interface';
import { User } from '../../domain/user';
import {
  CREATE_USER_REPOSITORY,
  CreateUserRepository,
} from '../../application/repository/create-user-repository.interface';
import { UserEntity } from '../../infrastructure/entities/user-entity';
import { CreateUserWithTempPasswordCmd } from '../../application/commands/create-user-with-temp-password-cmd';

export class CreateUserAdapter implements CreateUserPort {
  constructor(
    @Inject(CREATE_USER_REPOSITORY)
    private readonly createUserRepository: CreateUserRepository,
  ) {}

  async createUser(req: CreateUserWithTempPasswordCmd): Promise<User> {
    const res: UserEntity = await this.createUserRepository.createUser(
      req.username,
      req.surname,
      req.name,
      req.tempPassword,
    );

    return new User(res.id, res.username, res.surname, res.name, res.role);
  }
}

export const CREATE_USER_PORT = 'CREATE_USER_PORT';
