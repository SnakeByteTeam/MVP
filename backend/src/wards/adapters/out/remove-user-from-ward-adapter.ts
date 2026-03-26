import { RemoveUserFromWardCmd } from '../../application/commands/remove-user-from-ward-cmd';
import { RemoveUserFromWardPort } from '../../application/ports/out/remove-user-from-ward-port.interface';

export class RemoveUserFromWardAdapter implements RemoveUserFromWardPort {
  removeUserFromWard(req: RemoveUserFromWardCmd) {
    throw new Error('Method not implemented.');
  }
}

export const REMOVE_USER_FROM_WARD_PORT = 'REMOVE_USER_FROM_WARD_PORT';
