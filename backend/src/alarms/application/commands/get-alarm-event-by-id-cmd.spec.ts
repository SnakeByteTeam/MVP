import { GetAlarmEventByIdCmd } from './get-alarm-event-by-id-cmd';

describe('GetAlarmEventByIdCmd', () => {
  it('should be defined', () => {
    expect(new GetAlarmEventByIdCmd('test-id')).toBeDefined();
  });
});
