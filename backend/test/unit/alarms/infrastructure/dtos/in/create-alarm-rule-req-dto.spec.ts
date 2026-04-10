import { CreateAlarmRuleReqDto } from 'src/alarms/infrastructure/dtos/in/create-alarm-rule-req-dto';

describe('CreateAlarmRuleReqDto', () => {
  it('should be defined', () => {
    expect(new CreateAlarmRuleReqDto()).toBeDefined();
  });
});
