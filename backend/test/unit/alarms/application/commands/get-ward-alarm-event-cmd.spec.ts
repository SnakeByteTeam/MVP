import { GetWardAlarmEventCmd } from "src/alarms/application/commands/get-ward-alarm-event-cmd";

describe('GetAllUnmanagedAlarmEventsByUserIdCmd', () => {
  it('should be defined', () => {
    expect(new GetWardAlarmEventCmd('')).toBeDefined();
  });
});
