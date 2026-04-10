import { CreateAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/create-alarm-rule-res-dto';

describe('CreateAlarmRuleResDto', () => {
  it('should be defined', () => {
    expect(new CreateAlarmRuleResDto()).toBeDefined();
  });
});
