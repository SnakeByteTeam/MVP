import { GetAlarmEventByIdResDto } from 'src/alarms/infrastructure/dtos/out/get-alarm-event-by-id-res-dto';

describe('GetAlarmEventByIdResDto', () => {
  it('should be defined', () => {
    expect(new GetAlarmEventByIdResDto()).toBeDefined();
  });
});
