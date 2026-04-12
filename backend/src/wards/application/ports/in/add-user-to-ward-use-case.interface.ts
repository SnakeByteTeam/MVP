import { User } from 'src/wards/domain/user';
import { AddUserToWardCmd } from '../../commands/add-user-to-ward-cmd';

export interface AddUserToWardUseCase {
  addUserToWard(req: AddUserToWardCmd): Promise<User>;
}
