import { User } from '../../domain/user';

export interface FindAllAvailableUsersRepository {
  findAllAvailableUsers(): Promise<User[]>;
}

export const FIND_ALL_AVAILABLE_USERS_REPOSITORY =
  'FIND_ALL_AVAILABLE_USERS_REPOSITORY';
