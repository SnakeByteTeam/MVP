import { CreateAlarmCmd } from '../src/alarms/application/commands/create-alarm.cmd';
import { AlarmPriority } from '../src/alarms/domain/models/alarm-priority.enum';

describe('CreateAlarmCmd', () => {
  it('dovrebbe creare un comando con tutti i campi readonly e corretti', () => {
    const cmd = new CreateAlarmCmd(
      'Temperatura soglia',
      'plant-1',
      'device-1',
      AlarmPriority.RED,
      20,
      '08:00',
      '20:00',
    );

    expect(cmd.name).toBe('Temperatura soglia');
    expect(cmd.plantId).toBe('plant-1');
    expect(cmd.deviceId).toBe('device-1');
    expect(cmd.priority).toBe(AlarmPriority.RED);
    expect(cmd.threshold).toBe(20);
    expect(cmd.activationTime).toBe('08:00');
    expect(cmd.deactivationTime).toBe('20:00');
  });

  it('i campi dovrebbero essere readonly — non modificabili dopo la creazione', () => {
    const cmd = new CreateAlarmCmd(
      'Test', 'plant-1', 'device-1',
      AlarmPriority.WHITE, 10, '00:00', '23:59',
    );
//test che verifica che il valore rimanga invariato a runtime
    expect(() => {
      (cmd as any).name = 'Modified';
    }).toThrow();

    expect(cmd.name).toBe('Test');
  });
});
