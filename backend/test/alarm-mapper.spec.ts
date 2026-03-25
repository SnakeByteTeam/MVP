import { toModel } from '../src/alarms/application/repository/alarm-mapper';
import { AlarmEntity } from '../src/alarms/infrastructure/entities/alarm.entity';
import { AlarmPriority } from '../src/alarms/domain/models/alarm-priority.enum';
import { Alarm } from '../src/alarms/domain/models/alarm.model';

describe('alarm-mapper - toModel', () => {
  const createdAt = new Date('2024-01-01');
  const updatedAt = new Date('2024-01-02');

  const mockRow: AlarmEntity = {
    id: 'alarm-id-1',
    name: 'Temperatura soglia',
    plant_id: 'plant-1',
    device_id: 'device-1',
    priority: 'RED',
    threshold: 20,
    activation_time: '08:00',
    deactivation_time: '20:00',
    enabled: true,
    created_at: createdAt,
    updated_at: updatedAt,
  };

  it('dovrebbe tradurre correttamente una riga DB in Alarm', () => {
    const alarm = toModel(mockRow);

    expect(alarm).toBeInstanceOf(Alarm);
    expect(alarm.id).toBe('alarm-id-1');
    expect(alarm.name).toBe('Temperatura soglia');
    expect(alarm.plantId).toBe('plant-1');   // plant_id → plantId
    expect(alarm.deviceId).toBe('device-1'); // device_id → deviceId
    expect(alarm.priority).toBe(AlarmPriority.RED);
    expect(alarm.threshold).toBe(20);
    expect(alarm.activationTime).toBe('08:00');   // activation_time → activationTime
    expect(alarm.deactivationTime).toBe('20:00'); // deactivation_time → deactivationTime
    expect(alarm.enabled).toBe(true);
    expect(alarm.createdAt).toBe(createdAt);
    expect(alarm.updatedAt).toBe(updatedAt);
  });

  it('dovrebbe mappare la priority string come AlarmPriority enum', () => {
    const rowGreen = { ...mockRow, priority: 'GREEN' };
    const alarm = toModel(rowGreen);
    expect(alarm.priority).toBe(AlarmPriority.GREEN);
  });

  it('dovrebbe mappare un alarm disabilitato', () => {
    const rowDisabled = { ...mockRow, enabled: false };
    const alarm = toModel(rowDisabled);
    expect(alarm.enabled).toBe(false);
  });
});
