import { CreateAlarmEventCmd } from './create-alarm-event-cmd';

describe('CreateAlarmEventCmd', () => {
  it('should be defined', () => {
    expect(new CreateAlarmEventCmd('', new Date())).toBeDefined();
  });
});
