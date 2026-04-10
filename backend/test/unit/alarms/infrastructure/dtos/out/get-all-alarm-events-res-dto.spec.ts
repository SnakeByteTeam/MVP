import { GetAllAlarmEventsResDto } from 'src/alarms/infrastructure/dtos/out/get-all-alarm-events-res-dto';

describe('GetAllAlarmEventsResDto', () => {
  it('should be defined', () => {
    expect(new GetAllAlarmEventsResDto()).toBeDefined();
  });
});
