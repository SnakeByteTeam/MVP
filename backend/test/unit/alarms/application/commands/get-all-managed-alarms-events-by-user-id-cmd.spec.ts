import { GetAllManagedAlarmEventsByUserIdCmd } from 'src/alarms/application/commands/get-all-managed-alarm-events-by-user-id-cmd';

describe('GetAllManagedAlarmEventsByUserIdCmd', () => {
  it('should be defined', () => {
    expect(new GetAllManagedAlarmEventsByUserIdCmd(1)).toBeDefined();
  });
});
