import { ActiveAlarmDto } from '../src/alarms/infrastructure/dtos/active-alarm.dto';
import { ActiveAlarm } from '../src/alarms/domain/models/active-alarm.model';

describe('ActiveAlarmDto', () => {
  const triggeredAt = new Date('2024-01-01T10:00:00.000Z');

  describe('fromDomain - allarme non risolto', () => {
    const activeAlarm = new ActiveAlarm(
      'active-id-1',
      'alarm-id-1',
      'Temperatura soglia',
      'Temperatura oltre soglia',
      triggeredAt,
      null,
    );

    it('dovrebbe mappare correttamente tutti i campi', () => {
      const dto = ActiveAlarmDto.fromDomain(activeAlarm);

      expect(dto.id).toBe('active-id-1');
      expect(dto.alarmId).toBe('alarm-id-1');
      expect(dto.alarmName).toBe('Temperatura soglia');
      expect(dto.dangerSignal).toBe('Temperatura oltre soglia');
    });

    it('dovrebbe convertire triggeredAt in stringa ISO', () => {
      const dto = ActiveAlarmDto.fromDomain(activeAlarm);
      expect(dto.triggeredAt).toBe(triggeredAt.toISOString());
    });

    it('dovrebbe impostare resolvedAt a null se non risolto', () => {
      const dto = ActiveAlarmDto.fromDomain(activeAlarm);
      expect(dto.resolvedAt).toBeNull();
    });
  });

  describe('fromDomain - allarme risolto', () => {
    const resolvedAt = new Date('2024-01-01T12:00:00.000Z');
    const resolvedAlarm = new ActiveAlarm(
      'active-id-2', 'alarm-id-1', 'Test', 'Test signal',
      triggeredAt, resolvedAt,
    );

    it('dovrebbe convertire resolvedAt in stringa ISO se risolto', () => {
      const dto = ActiveAlarmDto.fromDomain(resolvedAlarm);
      expect(dto.resolvedAt).toBe(resolvedAt.toISOString());
    });
  });
});
