import { Inject } from '@nestjs/common';
import { FindAllAvailableUsersPort } from '../../application/ports/out/find-all-available-users-port.interface';
import { User } from '../../domain/user';
import {
  FIND_ALL_AVAILABLE_USERS_REPOSITORY,
  FindAllAvailableUsersRepository,
} from '../../application/repository/find-all-available-users-repository.interface';
import { UserEntity } from '../../infrastructure/entities/user-entity';

export class FindAllAvailableUsersAdapter implements FindAllAvailableUsersPort {
  constructor(
    @Inject(FIND_ALL_AVAILABLE_USERS_REPOSITORY)
    private readonly findAllAvailableUsersRepository: FindAllAvailableUsersRepository,
  ) {}

  async findAllAvailableUsers(): Promise<User[]> {
    const res: UserEntity[] =
      await this.findAllAvailableUsersRepository.findAllAvailableUsers();

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

export const FIND_ALL_AVAILABLE_USERS_PORT = 'FIND_ALL_AVAILABLE_USERS_PORT';
