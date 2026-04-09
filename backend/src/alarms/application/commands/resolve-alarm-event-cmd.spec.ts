import { ResolveAlarmEventCmd } from './resolve-alarm-event-cmd';

describe('ResolveAlarmEventCmd', () => {
  it('should be defined', () => {
    expect(new ResolveAlarmEventCmd('', 1)).toBeDefined();
  });
});
