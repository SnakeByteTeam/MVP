import { User } from '../../../domain/user';
import { FindAllUsersByWardIdCmd } from '../../commands/find-all-users-by-ward-id-cmd';

export interface FindAllUsersByWardIdPort {
  findAllUsersByWardId(req: FindAllUsersByWardIdCmd): Promise<User[]>;
}

export const FIND_ALL_USERS_BY_WARD_ID_PORT = 'FIND_ALL_USERS_BY_WARD_ID_PORT';
