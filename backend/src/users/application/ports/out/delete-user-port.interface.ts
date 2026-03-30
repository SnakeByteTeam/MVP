import { DeleteUserCmd } from '../../commands/delete-user-cmd';

export interface DeleteUserPort {
  deleteUser(req: DeleteUserCmd): void;
}
