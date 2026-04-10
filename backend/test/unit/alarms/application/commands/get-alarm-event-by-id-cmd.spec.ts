import { GetAlarmEventByIdCmd } from 'src/alarms/application/commands/get-alarm-event-by-id-cmd';

describe('GetAlarmEventByIdCmd', () => {
  it('should be defined', () => {
    expect(new GetAlarmEventByIdCmd('test-id')).toBeDefined();
  });
});
