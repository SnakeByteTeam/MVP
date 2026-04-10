import { DeleteAlarmRuleCmd } from 'src/alarms/application/commands/delete-alarm-rule-cmd';

describe('DeleteAlarmRuleCmd', () => {
  it('should be defined', () => {
    expect(new DeleteAlarmRuleCmd('')).toBeDefined();
  });
});
