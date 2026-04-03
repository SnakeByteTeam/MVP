import { Inject } from '@nestjs/common';
import { FindAllUsersByWardIdCmd } from '../../application/commands/find-all-users-by-ward-id-cmd';
import { FindAllUsersByWardIdPort } from '../../application/ports/out/find-all-users-by-ward-id-port.interface';
import {
  FIND_ALL_USERS_BY_WARD_ID_REPOSITORY,
  FindAllUsersByWardIdRepository,
} from '../../application/repository/find-all-users-by-ward-id-repository.interface';
import { UserEntity } from '../../infrastructure/entities/user-entity';
import { User } from '../../domain/user';

export class FindAllUsersByWardIdAdapter implements FindAllUsersByWardIdPort {
  constructor(
    @Inject(FIND_ALL_USERS_BY_WARD_ID_REPOSITORY)
    private readonly findAllUsersByWardIdRepository: FindAllUsersByWardIdRepository,
  ) {}

  async findAllUsersByWardId(req: FindAllUsersByWardIdCmd): Promise<User[]> {
    const userEntities: UserEntity[] =
      await this.findAllUsersByWardIdRepository.findAllUsersByWardId(req.id);

    return userEntities.map(
      (userEntity) => new User(userEntity.id, userEntity.username),
    );
  }
}

export const FIND_ALL_USERS_BY_WARD_ID_PORT = 'FIND_ALL_USERS_BY_WARD_ID_PORT';
