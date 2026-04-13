import { UpdateAlarmRuleCmd } from "src/alarms/application/commands/update-alarm-rule.cmd";
import { AlarmPriority } from "src/alarms/domain/models/alarm-priority.enum";


describe('CreateAlarmRuleCmd', () => {
    it('should be defined', () => {
        expect(new UpdateAlarmRuleCmd('','',AlarmPriority.WHITE, '', '', '', '', true)).toBeDefined();
    });
});
