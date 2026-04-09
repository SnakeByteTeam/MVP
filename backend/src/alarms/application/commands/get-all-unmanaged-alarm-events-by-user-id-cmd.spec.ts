import { GetAllUnmanagedAlarmEventsByUserIdCmd } from './get-all-unmanaged-alarm-events-by-user-id-cmd';

describe('GetAllUnmanagedAlarmEventsByUserIdCmd', () => {
  it('should be defined', () => {
    expect(new GetAllUnmanagedAlarmEventsByUserIdCmd(1)).toBeDefined();
  });
});
