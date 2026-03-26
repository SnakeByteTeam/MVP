import { Ward } from '../../../domain/ward';
import { CreateWardCmd } from '../../commands/create-ward-cmd';

export interface CreateWardUseCase {
  createWard(req: CreateWardCmd): Promise<Ward>;
}
