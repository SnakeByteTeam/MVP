import { TriggerActiveAlarmCmd } from '../src/alarms/application/commands/trigger-active-alarm.cmd';

describe('TriggerActiveAlarmCmd', () => {
  it('dovrebbe creare un comando con tutti i campi corretti', () => {
    const cmd = new TriggerActiveAlarmCmd(
      'alarm-id-1',
      'Temperatura soglia',
      'Temperatura oltre la soglia',
    );

    expect(cmd.alarmId).toBe('alarm-id-1');
    expect(cmd.alarmName).toBe('Temperatura soglia');
    expect(cmd.dangerSignal).toBe('Temperatura oltre la soglia');
  });

  it('i campi dovrebbero essere readonly', () => {
    const cmd = new TriggerActiveAlarmCmd('alarm-id-1', 'Test', 'Signal');

    expect(() => {
      (cmd as any).alarmId = 'altro-id';
    }).toThrow();

    expect(cmd.alarmId).toBe('alarm-id-1');
  });
});
