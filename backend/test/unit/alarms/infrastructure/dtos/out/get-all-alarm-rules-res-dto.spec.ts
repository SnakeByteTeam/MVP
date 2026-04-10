import { GetAllAlarmRulesResDto } from 'src/alarms/infrastructure/dtos/out/get-all-alarm-rules-res-dto';

describe('GetAllAlarmRulesResDto', () => {
  it('should be defined', () => {
    expect(new GetAllAlarmRulesResDto()).toBeDefined();
  });
});
