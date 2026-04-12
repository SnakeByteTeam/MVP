import { DeleteWardCmd } from '../../commands/delete-ward-cmd';

export interface DeleteWardPort {
  deleteWard(req: DeleteWardCmd): Promise<void>;
}

export const DELETE_WARD_PORT = 'DELETE_WARD_PORT';
