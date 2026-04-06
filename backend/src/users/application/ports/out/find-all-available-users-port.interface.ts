import { User } from '../../../domain/user';

export interface FindAllAvailableUsersPort {
  findAllAvailableUsers(): Promise<User[]>;
}

export const FIND_ALL_AVAILABLE_USERS_PORT = 'FIND_ALL_AVAILABLE_USERS_PORT';
