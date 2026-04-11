import { RemoveUserFromWardCmd } from '../../commands/remove-user-from-ward-cmd';

export interface RemoveUserFromWardPort {
  removeUserFromWard(req: RemoveUserFromWardCmd): Promise<void>;
}

export const REMOVE_USER_FROM_WARD_PORT = 'REMOVE_USER_FROM_WARD_PORT';
