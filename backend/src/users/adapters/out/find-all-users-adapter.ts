import { Inject } from '@nestjs/common';
import { FindAllUsersPort } from '../../application/ports/out/find-all-users-port.interface';
import {
  FIND_ALL_USERS_REPOSITORY,
  FindAllUsersRepository,
} from '../../application/repository/find-all-users-repository.interface';
import { User } from '../../domain/user';
import { UserEntity } from '../../infrastructure/entities/user-entity';

export class FindAllUsersAdapter implements FindAllUsersPort {
  constructor(
    @Inject(FIND_ALL_USERS_REPOSITORY)
    private readonly findAllUsersRepository: FindAllUsersRepository,
  ) {}

  async findAllUsers(): Promise<User[]> {
    const res: UserEntity[] = await this.findAllUsersRepository.findAllUsers();

    return res.map(
      (element) =>
        new User(
          element.id,
          element.username,
          element.surname,
          element.name,
          element.role,
        ),
    );
  }
}

export const FIND_ALL_USERS_PORT = 'FIND_ALL_USERS_PORT';
