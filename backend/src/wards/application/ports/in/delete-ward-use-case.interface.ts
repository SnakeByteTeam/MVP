import { DeleteWardCmd } from '../../commands/delete-ward-cmd';

export interface DeleteWardUseCase {
  deleteWard(req: DeleteWardCmd): void;
}
