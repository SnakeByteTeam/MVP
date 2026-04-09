import { RemoveUserFromWardCmd } from '../../commands/remove-user-from-ward-cmd';

export interface RemoveUserFromWardUseCase {
  removeUserFromWard(req: RemoveUserFromWardCmd);
}
