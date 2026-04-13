import { Ward } from '../../../domain/ward';
import { CreateWardCmd } from '../../commands/create-ward-cmd';

export interface CreateWardPort {
  createWard(req: CreateWardCmd): Promise<Ward>;
}

export const CREATE_WARD_PORT = 'CREATE_WARD_PORT';
