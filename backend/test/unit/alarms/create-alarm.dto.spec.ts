import { CreateAlarmDto } from '../../../src/alarms/infrastructure/dtos/create-alarm.dto';
import { AlarmPriority } from '../../../src/alarms/domain/models/alarm-priority.enum';

describe('CreateAlarmDto', () => {
  it('dovrebbe creare un dto con tutti i campi assegnati correttamente', () => {
    const dto = new CreateAlarmDto();
    dto.name = 'Temperatura soglia';
    dto.plantId = 'plant-1';
    dto.deviceId = 'device-1';
    dto.priority = AlarmPriority.RED;
    dto.threshold = 20;
    dto.activationTime = '08:00';
    dto.deactivationTime = '20:00';

    expect(dto.name).toBe('Temperatura soglia');
    expect(dto.plantId).toBe('plant-1');
    expect(dto.deviceId).toBe('device-1');
    expect(dto.priority).toBe(AlarmPriority.RED);
    expect(dto.threshold).toBe(20);
    expect(dto.activationTime).toBe('08:00');
    expect(dto.deactivationTime).toBe('20:00');
  });

  it('dovrebbe accettare tutte le priorità', () => {
    const dto = new CreateAlarmDto();

    dto.priority = AlarmPriority.WHITE;
    expect(dto.priority).toBe(AlarmPriority.WHITE);

    dto.priority = AlarmPriority.GREEN;
    expect(dto.priority).toBe(AlarmPriority.GREEN);

    dto.priority = AlarmPriority.ORANGE;
    expect(dto.priority).toBe(AlarmPriority.ORANGE);

    dto.priority = AlarmPriority.RED;
    expect(dto.priority).toBe(AlarmPriority.RED);
  });
});
