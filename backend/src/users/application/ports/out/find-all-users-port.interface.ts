import { User } from '../../../domain/user';

export interface FindAllUsersPort {
  findAllUsers(): Promise<User[]>;
}

export const FIND_ALL_USERS_PORT = 'FIND_ALL_USERS_PORT';
