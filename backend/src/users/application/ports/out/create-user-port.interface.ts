import { User } from '../../../domain/user';
import { CreateUserWithTempPasswordCmd } from '../../commands/create-user-with-temp-password-cmd';

export interface CreateUserPort {
  createUser(req: CreateUserWithTempPasswordCmd): Promise<User>;
}
