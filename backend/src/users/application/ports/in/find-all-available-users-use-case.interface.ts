import { User } from '../../../domain/user';

export interface FindAllAvailableUsersUseCase {
  findAllAvailableUsers(): Promise<User[]>;
}
