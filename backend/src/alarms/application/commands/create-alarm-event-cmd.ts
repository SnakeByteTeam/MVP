export class CreateAlarmEventCmd {
  constructor(
    public readonly alarmRuleId: string,
    public readonly activationTime: Date,
  ) {}
}
