import { UpdateAlarmDto } from '../../../src/alarms/infrastructure/dtos/update-alarm.dto';
import { AlarmPriority } from '../../../src/alarms/domain/models/alarm-priority.enum';

describe('UpdateAlarmDto', () => {
  it('dovrebbe creare un dto vuoto con tutti i campi undefined', () => {
    const dto = new UpdateAlarmDto();

    expect(dto.priority).toBeUndefined();
    expect(dto.threshold).toBeUndefined();
    expect(dto.activationTime).toBeUndefined();
    expect(dto.deactivationTime).toBeUndefined();
    expect(dto.enabled).toBeUndefined();
  });

  it('dovrebbe permettere di impostare solo la priorità', () => {
    const dto = new UpdateAlarmDto();
    dto.priority = AlarmPriority.GREEN;

    expect(dto.priority).toBe(AlarmPriority.GREEN);
    expect(dto.threshold).toBeUndefined();
    expect(dto.enabled).toBeUndefined();
  });

  it('dovrebbe permettere di impostare solo enabled', () => {
    const dto = new UpdateAlarmDto();
    dto.enabled = false;

    expect(dto.enabled).toBe(false);
    expect(dto.priority).toBeUndefined();
  });

  it('dovrebbe permettere di impostare tutti i campi', () => {
    const dto = new UpdateAlarmDto();
    dto.priority = AlarmPriority.RED;
    dto.threshold = 30;
    dto.activationTime = '09:00';
    dto.deactivationTime = '21:00';
    dto.enabled = true;

    expect(dto.priority).toBe(AlarmPriority.RED);
    expect(dto.threshold).toBe(30);
    expect(dto.activationTime).toBe('09:00');
    expect(dto.deactivationTime).toBe('21:00');
    expect(dto.enabled).toBe(true);
  });
});
