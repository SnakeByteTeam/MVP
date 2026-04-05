export class GetAllUnmanagedAlarmEventsByUserIdCmd {
  constructor(
    public readonly id: number,
    public limit: number = 5,
    public offset: number = 0,
  ) {}
}
