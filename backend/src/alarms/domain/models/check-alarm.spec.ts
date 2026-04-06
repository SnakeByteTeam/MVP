import { CheckAlarm } from './check-alarm';

describe('CheckAlarm', () => {
  it('should be defined', () => {
    expect(new CheckAlarm('rule-1', 1)).toBeDefined();
  });
});
