import { Ward } from '../../../domain/ward';
import { UpdateWardCmd } from '../../commands/update-ward-cmd';

export interface UpdateWardPort {
  updateWard(req: UpdateWardCmd): Promise<Ward>;
}

export const UPDATE_WARD_PORT = 'UPDATE_WARD_PORT';
