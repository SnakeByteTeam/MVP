import { GetAlarmRuleByIdCmd } from 'src/alarms/application/commands/get-alarm-rule-by-id-cmd';

describe('GetAlarmRuleByIdCmd', () => {
  it('should be defined', () => {
    expect(new GetAlarmRuleByIdCmd('')).toBeDefined();
  });
});
