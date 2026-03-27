import { RemoveUserFromWardCmd } from '../../commands/remove-user-from-ward-cmd';

export interface RemoveUserFromWardPort {
  removeUserFromWard(req: RemoveUserFromWardCmd): Promise<void>;
}
