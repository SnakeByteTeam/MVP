export class CheckAlarmRuleCmd {
  constructor(
    public datapointId: string,
    public value: string,
    public activationTime: Date,
  ) {}
}
