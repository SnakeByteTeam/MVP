import { UpdateAlarmCmd } from '../src/alarms/application/commands/update-alarm-rule.cmd';
import { AlarmPriority } from '../src/alarms/domain/models/alarm-priority.enum';

describe('UpdateAlarmCmd', () => {
  it('dovrebbe creare un comando con solo id obbligatorio', () => {
    const cmd = new UpdateAlarmCmd('alarm-id-1');

    expect(cmd.id).toBe('alarm-id-1');
    expect(cmd.priority).toBeUndefined();
    expect(cmd.threshold).toBeUndefined();
    expect(cmd.activationTime).toBeUndefined();
    expect(cmd.deactivationTime).toBeUndefined();
    expect(cmd.enabled).toBeUndefined();
  });

  it('dovrebbe creare un comando con tutti i campi opzionali', () => {
    const cmd = new UpdateAlarmCmd(
      'alarm-id-1',
      AlarmPriority.GREEN,
      25,
      '09:00',
      '21:00',
      false,
    );

    expect(cmd.id).toBe('alarm-id-1');
    expect(cmd.priority).toBe(AlarmPriority.GREEN);
    expect(cmd.threshold).toBe(25);
    expect(cmd.activationTime).toBe('09:00');
    expect(cmd.deactivationTime).toBe('21:00');
    expect(cmd.enabled).toBe(false);
  });

  it('dovrebbe creare un comando con solo priority', () => {
    const cmd = new UpdateAlarmCmd('alarm-id-1', AlarmPriority.ORANGE);

    expect(cmd.id).toBe('alarm-id-1');
    expect(cmd.priority).toBe(AlarmPriority.ORANGE);
    expect(cmd.threshold).toBeUndefined();
  });
});
