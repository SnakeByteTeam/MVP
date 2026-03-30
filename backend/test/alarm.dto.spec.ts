import { AlarmDto } from '../src/alarms/infrastructure/dtos/alarm.dto';
import { Alarm } from '../src/alarms/domain/models/alarm.model';
import { AlarmPriority } from '../src/alarms/domain/models/alarm-priority.enum';

describe('AlarmDto', () => {
  const createdAt = new Date('2024-01-01');
  const updatedAt = new Date('2024-01-02');

  const mockAlarm = new Alarm(
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

  describe('fromDomain', () => {
    it('dovrebbe mappare correttamente tutti i campi dal domain model', () => {
      const dto = AlarmDto.fromDomain(mockAlarm);

      expect(dto.id).toBe('alarm-id-1');
      expect(dto.name).toBe('Temperatura soglia');
      expect(dto.plantId).toBe('plant-1');
      expect(dto.deviceId).toBe('device-1');
      expect(dto.priority).toBe(AlarmPriority.RED);
      expect(dto.threshold).toBe(20);
      expect(dto.activationTime).toBe('08:00');
      expect(dto.deactivationTime).toBe('20:00');
      expect(dto.enabled).toBe(true);
      expect(dto.createdAt).toBe(createdAt);
      expect(dto.updatedAt).toBe(updatedAt);
    });

    it('dovrebbe restituire un\'istanza di AlarmDto', () => {
      const dto = AlarmDto.fromDomain(mockAlarm);
      expect(dto).toBeInstanceOf(AlarmDto);
    });
  });
});
