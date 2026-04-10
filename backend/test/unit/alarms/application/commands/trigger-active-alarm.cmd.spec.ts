import { TriggerActiveAlarmCmd } from 'src/alarms/application/commands/trigger-active-alarm.cmd';

describe('TriggerActiveAlarmCmd', () => {
  it('mantiene i parametri passati al costruttore', () => {
    const cmd = new TriggerActiveAlarmCmd('alarm-1', 'Allarme caduta', 'panic-button');

    expect(cmd.alarmId).toBe('alarm-1');
    expect(cmd.alarmName).toBe('Allarme caduta');
    expect(cmd.dangerSignal).toBe('panic-button');
  });
});
