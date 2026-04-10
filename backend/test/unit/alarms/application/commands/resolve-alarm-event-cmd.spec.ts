import { ResolveAlarmEventCmd } from 'src/alarms/application/commands/resolve-alarm-event-cmd';

describe('ResolveAlarmEventCmd', () => {
  it('should be defined', () => {
    expect(new ResolveAlarmEventCmd('', 1)).toBeDefined();
  });
});
