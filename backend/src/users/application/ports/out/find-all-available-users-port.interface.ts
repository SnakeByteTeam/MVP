import { User } from '../../../domain/user';

export interface FindAllAvailableUsersPort {
  findAllAvailableUsers(): Promise<User[]>;
}
