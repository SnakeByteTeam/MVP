import { GetAllAlarmEventsCmd } from 'src/alarms/application/commands/get-all-alarm-events-cmd';

describe('GetAllAlarmEventsCmd', () => {
  it('should be defined', () => {
    expect(new GetAllAlarmEventsCmd()).toBeDefined();
  });
});
