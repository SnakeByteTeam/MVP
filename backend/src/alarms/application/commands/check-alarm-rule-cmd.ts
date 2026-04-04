export class CheckAlarmRuleCmd {
  constructor(
    public deviceId: string,
    public value: string,
    public activationTime: Date,
  ) {}
}
