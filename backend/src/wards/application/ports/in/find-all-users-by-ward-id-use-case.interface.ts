import { User } from '../../../domain/user';
import { FindAllUsersByWardIdCmd } from '../../commands/find-all-users-by-ward-id-cmd';

export interface FindAllUsersByWardIdUseCase {
  findAllUsersByWardId(req: FindAllUsersByWardIdCmd): Promise<User[]>;
}
