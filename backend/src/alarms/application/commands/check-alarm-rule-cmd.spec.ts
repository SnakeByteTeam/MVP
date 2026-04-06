import { CheckAlarmRuleCmd } from './check-alarm-rule-cmd';

describe('CheckAlarmRuleCmd', () => {
  it('should be defined', () => {
    expect(new CheckAlarmRuleCmd('', '', new Date())).toBeDefined();
  });
});
