import { UpdateAlarmRuleReqDto } from 'src/alarms/infrastructure/dtos/in/update-alarm-rule-req-dto';

describe('UpdateAlarmRuleReqDto', () => {
  it('should be defined', () => {
    expect(new UpdateAlarmRuleReqDto()).toBeDefined();
  });
});
