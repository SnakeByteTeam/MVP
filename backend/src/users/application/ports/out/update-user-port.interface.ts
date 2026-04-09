import { User } from '../../../domain/user';
import { UpdateUserCmd } from '../../commands/update-user-cmd';

export interface UpdateUserPort {
  updateUser(req: UpdateUserCmd): Promise<User>;
}

export const UPDATE_USER_PORT = 'UPDATE_USER_PORT';
