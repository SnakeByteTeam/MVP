import { DeleteUserCmd } from '../../commands/delete-user-cmd';

export interface DeleteUserPort {
  deleteUser(req: DeleteUserCmd): Promise<void>;
}

export const DELETE_USER_PORT = 'DELETE_USER_PORT';
