import { GetAllManagedAlarmEventsByUserIdResDto } from 'src/alarms/infrastructure/dtos/out/get-all-managed-alarm-events-by-user-id-res-dto';

describe('GetAllManagedAlarmEventsByUserIdResDto', () => {
  it('should be defined', () => {
    expect(new GetAllManagedAlarmEventsByUserIdResDto()).toBeDefined();
  });
});
