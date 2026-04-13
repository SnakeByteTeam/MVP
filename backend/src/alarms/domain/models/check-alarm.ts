export class CheckAlarm {
  constructor(
    public readonly alarmRuleId: string,
    public readonly wardId: number,
    public readonly alarmEventId?: string,
  ) {}
}
