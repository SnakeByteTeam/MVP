import { User } from './user';

export class CreatedUser extends User {
  constructor(
    id: number,
    username: string,
    surname: string,
    name: string,
    role: string,
    public tempPassword: string,
  ) {
    super(id, username, surname, name, role);
  }
}
