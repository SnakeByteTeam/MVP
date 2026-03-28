export class PayloadEntity {
  constructor(
    public id: number,
    public username: string,
    public role: string,
    public firstAccess: boolean,
  ) {}
}
