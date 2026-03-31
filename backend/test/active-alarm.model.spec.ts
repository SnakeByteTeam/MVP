import { ActiveAlarm } from '../src/alarms/domain/models/active-alarm.model';

describe('ActiveAlarm', () => {
  const triggeredAt = new Date('2024-01-01T10:00:00');

  it('dovrebbe creare un ActiveAlarm con tutti i campi corretti', () => {
    const activeAlarm = new ActiveAlarm(
      'active-id-1',
      'alarm-id-1',
      'Temperatura soglia',
      'Temperatura oltre soglia',
      triggeredAt,
      null,
    );

    expect(activeAlarm.id).toBe('active-id-1');
    expect(activeAlarm.alarmId).toBe('alarm-id-1');
    expect(activeAlarm.alarmName).toBe('Temperatura soglia');
    expect(activeAlarm.dangerSignal).toBe('Temperatura oltre soglia');
    expect(activeAlarm.triggeredAt).toBe(triggeredAt);
    expect(activeAlarm.resolvedAt).toBeNull();
  });

  it('isActive dovrebbe restituire true se resolvedAt è null', () => {
    const activeAlarm = new ActiveAlarm(
      'active-id-1',
      'alarm-id-1',
      'Test',
      'Test signal',
      triggeredAt,
      null,
    );

    expect(activeAlarm.isActive).toBe(true);
  });

  it('isActive dovrebbe restituire false se resolvedAt è una data', () => {
    const resolvedAt = new Date('2024-01-01T12:00:00');
    const activeAlarm = new ActiveAlarm(
      'active-id-1',
      'alarm-id-1',
      'Test',
      'Test signal',
      triggeredAt,
      resolvedAt,
    );

    expect(activeAlarm.isActive).toBe(false);
  });

  it('dovrebbe creare un ActiveAlarm già risolto', () => {
    const resolvedAt = new Date('2024-01-01T12:00:00');
    const activeAlarm = new ActiveAlarm(
      'active-id-2',
      'alarm-id-1',
      'Test',
      'Test signal',
      triggeredAt,
      resolvedAt,
    );

    expect(activeAlarm.resolvedAt).toBe(resolvedAt);
    expect(activeAlarm.isActive).toBe(false);
  });
});
