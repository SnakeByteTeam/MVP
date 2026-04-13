import { User } from './user';

export class CreatedUser extends User {
  constructor(
    id: number,
    username: string,
    surname?: string,
    name?: string,
    role?: string,
    private readonly tempPassword?: string,
  ) {
    super(id, username, surname, name, role);
  }

  getTempPassword(): string | undefined {
    return this.tempPassword ?? undefined;
  }
}
