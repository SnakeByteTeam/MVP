import { CreateAlarmRuleCmd } from "src/alarms/application/commands/create-alarm-rule.cmd";
import { AlarmPriority } from "src/alarms/domain/models/alarm-priority.enum";


describe('CreateAlarmRuleCmd', () => {
    it('should be defined', () => {
        expect(new CreateAlarmRuleCmd('', '', '', '', AlarmPriority.WHITE, '', '', '', '')).toBeDefined();
    });
});
