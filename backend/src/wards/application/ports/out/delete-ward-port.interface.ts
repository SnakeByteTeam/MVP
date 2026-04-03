import { DeleteWardCmd } from '../../commands/delete-ward-cmd';

export interface DeleteWardPort {
  deleteWard(req: DeleteWardCmd): Promise<void>;
}
