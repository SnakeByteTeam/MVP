import { User } from '../../../domain/user';
import { AddUserToWardCmd } from '../../commands/add-user-to-ward-cmd';

export interface AddUserToWardPort {
  addUserToWard(req: AddUserToWardCmd): Promise<User>;
}

export const ADD_USER_TO_WARD_PORT = 'ADD_USER_TO_WARD_PORT';
