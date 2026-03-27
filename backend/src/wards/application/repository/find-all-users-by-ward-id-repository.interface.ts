import { UserEntity } from '../../infrastructure/entities/user-entity';

export interface FindAllUsersByWardIdRepository {
  findAllUsersByWardId(wardId: number): Promise<UserEntity[]>;
}

export const FIND_ALL_USERS_BY_WARD_ID_REPOSITORY =
  'FIND_ALL_USERS_BY_WARD_ID_REPOSITORY';
