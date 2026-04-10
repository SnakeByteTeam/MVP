import { CheckAlarmRuleCmd } from 'src/alarms/application/commands/check-alarm-rule-cmd';

describe('CheckAlarmRuleCmd', () => {
  it('should be defined', () => {
    expect(new CheckAlarmRuleCmd('', '', new Date())).toBeDefined();
  });
});
