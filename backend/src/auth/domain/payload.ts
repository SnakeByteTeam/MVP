export class Payload {
  constructor(
    public id: number,
    public username: string,
    public role: string,
    public firstAccess: boolean,
  ) {}
}
