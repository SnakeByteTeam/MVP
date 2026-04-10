import { GetAlarmRuleByIdResDto } from 'src/alarms/infrastructure/dtos/out/get-alarm-rule-by-id-res-dto';

describe('GetAlarmRuleByIdResDto', () => {
  it('should be defined', () => {
    expect(new GetAlarmRuleByIdResDto()).toBeDefined();
  });
});
