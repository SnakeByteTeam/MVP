import { CheckAlarm } from './check-alarm';

describe('CheckAlarm', () => {
  it('should be defined', () => {
    expect(new CheckAlarm('ALM001', 1)).toBeDefined();
  });
});
