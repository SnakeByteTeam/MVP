import { User } from '../../../domain/user';
import { FindUserByIdCmd } from '../../commands/find-user-by-id-cmd';

export interface FindUserByIdUseCase {
  findUserById(req: FindUserByIdCmd): Promise<User | null>;
}
