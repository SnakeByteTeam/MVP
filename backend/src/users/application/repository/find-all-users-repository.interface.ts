import { UserEntity } from '../../infrastructure/entities/user-entity';

export interface FindAllUsersRepository {
  findAllUsers(): Promise<UserEntity[]>;
}

export const FIND_ALL_USERS_REPOSITORY = 'FIND_ALL_USERS_REPOSITORY';
