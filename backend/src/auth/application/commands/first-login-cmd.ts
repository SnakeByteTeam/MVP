export class FirstLoginCmd {
  constructor(
    public username: string,
    public password: string,
    public tempPassword: string,
  ) {}
}
