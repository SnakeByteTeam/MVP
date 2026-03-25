import { User } from '../../../domain/user';

export interface FindAllUsersUseCase {
  findAllUsers(): Promise<User[]>;
}
