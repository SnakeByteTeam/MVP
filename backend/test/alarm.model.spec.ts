import { Alarm } from '../src/alarms/domain/models/alarm.model';
import { AlarmPriority } from '../src/alarms/domain/models/alarm-priority.enum';

describe('Alarm', () => {
  const createdAt = new Date('2024-01-01');
  const updatedAt = new Date('2024-01-02');

  it('dovrebbe creare un Alarm con tutti i campi corretti', () => {
    const alarm = new Alarm(
      'alarm-id-1',
      'Temperatura soglia',
      'plant-1',
      'device-1',
      AlarmPriority.RED,
      20,
      '08:00',
      '20:00',
      true,
      createdAt,
      updatedAt,
    );

    expect(alarm.id).toBe('alarm-id-1');
    expect(alarm.name).toBe('Temperatura soglia');
    expect(alarm.plantId).toBe('plant-1');
    expect(alarm.deviceId).toBe('device-1');
    expect(alarm.priority).toBe(AlarmPriority.RED);
    expect(alarm.threshold).toBe(20);
    expect(alarm.activationTime).toBe('08:00');
    expect(alarm.deactivationTime).toBe('20:00');
    expect(alarm.enabled).toBe(true);
    expect(alarm.createdAt).toBe(createdAt);
    expect(alarm.updatedAt).toBe(updatedAt);
  });

  it('dovrebbe creare un Alarm disabilitato', () => {
    const alarm = new Alarm(
      'alarm-id-2', 'Test', 'plant-1', 'device-1',
      AlarmPriority.WHITE, 10, '00:00', '23:59',
      false, createdAt, updatedAt,
    );

    expect(alarm.enabled).toBe(false);
  });
});
