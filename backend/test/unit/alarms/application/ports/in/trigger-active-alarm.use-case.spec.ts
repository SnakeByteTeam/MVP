import {
  TRIGGER_ACTIVE_ALARM_USE_CASE,
  TriggerActiveAlarmUseCase,
} from 'src/alarms/application/ports/in/trigger-active-alarm.use-case';
import { TriggerActiveAlarmCmd } from 'src/alarms/application/commands/trigger-active-alarm.cmd';

describe('TriggerActiveAlarmUseCase token', () => {
  it('espone il token DI atteso', () => {
    expect(TRIGGER_ACTIVE_ALARM_USE_CASE).toBe('TRIGGER_ACTIVE_ALARM_USE_CASE');
  });

  it('definisce la firma triggerActiveAlarm', async () => {
    const mockUseCase: TriggerActiveAlarmUseCase = {
      triggerActiveAlarm: jest.fn().mockResolvedValue(undefined),
    };
    const cmd = new TriggerActiveAlarmCmd('alarm-77', 'Allarme test', 'sensor');

    await expect(mockUseCase.triggerActiveAlarm(cmd)).resolves.toBeUndefined();
    expect(mockUseCase.triggerActiveAlarm).toHaveBeenCalledWith(cmd);
  });
});
