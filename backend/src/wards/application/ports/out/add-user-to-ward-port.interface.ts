import { AddUserToWardCmd } from '../../commands/add-user-to-ward-cmd';

export interface AddUserToWardPort {
  addUserToWard(req: AddUserToWardCmd);
}
