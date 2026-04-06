import { User } from '../../../domain/user';
import { FindUserByIdCmd } from '../../commands/find-user-by-id-cmd';

export interface FindUserByIdPort {
  findUserById(req: FindUserByIdCmd): Promise<User | null>;
}

export const FIND_USER_BY_ID_PORT = 'FIND_USER_BY_ID_PORT';
