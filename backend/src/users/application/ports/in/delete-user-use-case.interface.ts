import { DeleteUserCmd } from '../../commands/delete-user-cmd';

export interface DeleteUserUseCase {
  deleteUser(req: DeleteUserCmd);
}
