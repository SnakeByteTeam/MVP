import { GetAllUnmanagedAlarmEventsByUserIdResDto } from 'src/alarms/infrastructure/dtos/out/get-all-unmanaged-alarm-events-by-user-id-res-dto';

describe('GetAllUnmanagedAlarmEventsByUserIdResDto', () => {
  it('should be defined', () => {
    expect(new GetAllUnmanagedAlarmEventsByUserIdResDto()).toBeDefined();
  });
});
