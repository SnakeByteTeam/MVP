import { UpdateAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/update-alarm-rule-res-dto';

describe('UpdateAlarmRuleResDto', () => {
  it('should be defined', () => {
    expect(new UpdateAlarmRuleResDto()).toBeDefined();
  });
});
