export class UserEntity {
  constructor(
    public id: number,
    public username: string,
    public surname: string,
    public name: string,
    public role: string,
  ) {}
}
