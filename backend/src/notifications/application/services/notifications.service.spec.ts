import { CheckAlarm } from 'src/alarms/domain/models/check-alarm';
import { NotifyAlarmResolutionPort } from '../ports/out/notify-alarm-resolution.port';
import { NotifyAlarmWardPort } from '../ports/out/notify-alarm-ward.port';
import { WriteNotificationPort } from '../ports/out/write-notification.port';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notifyPort: jest.Mocked<NotifyAlarmWardPort>;
  let notifyResolutionPort: jest.Mocked<NotifyAlarmResolutionPort>;
  let writeNotificationPort: jest.Mocked<WriteNotificationPort>;

  beforeEach(() => {
    notifyPort = {
      notifyAlarmWard: jest.fn(),
    };
    notifyResolutionPort = {
      notifyAlarmResolution: jest.fn(),
    };
    writeNotificationPort = {
      writeNotification: jest.fn(),
    };

    service = new NotificationsService(
      notifyPort,
      notifyResolutionPort,
      writeNotificationPort,
    );
  });

  it('should notify ward and persist notification on alarm activation', async () => {
    notifyPort.notifyAlarmWard.mockResolvedValue(undefined);
    writeNotificationPort.writeNotification.mockResolvedValue(true);

    const alarm = new CheckAlarm('rule-1', 4, 'alarm-event-1');

    await service.notifyAlarmWard({ alarm });

    expect(notifyPort.notifyAlarmWard).toHaveBeenCalledWith({ alarm });
    expect(writeNotificationPort.writeNotification).toHaveBeenCalledTimes(1);
    const writeCall = writeNotificationPort.writeNotification.mock.calls[0][0];
    expect(writeCall.alarm_event_id).toBe('alarm-event-1');
    expect(writeCall.ward_id).toBe(4);
    expect(Date.parse(writeCall.timestamp)).not.toBeNaN();
  });

  it('should throw when alarm event id is missing on activation', async () => {
    notifyPort.notifyAlarmWard.mockResolvedValue(undefined);

    const alarm = new CheckAlarm('rule-1', 4);

    await expect(service.notifyAlarmWard({ alarm })).rejects.toThrow(
      "Can't write notification without alarm event id",
    );
    expect(writeNotificationPort.writeNotification).toHaveBeenCalledTimes(0);
  });

  it('should notify resolution and persist notification', async () => {
    notifyResolutionPort.notifyAlarmResolution.mockResolvedValue(undefined);
    writeNotificationPort.writeNotification.mockResolvedValue(true);

    await service.notifyAlarmResolution({ alarmId: 'alarm-2', wardId: 5 });

    expect(notifyResolutionPort.notifyAlarmResolution).toHaveBeenCalledWith({
      alarmId: 'alarm-2',
      wardId: 5,
    });
    expect(writeNotificationPort.writeNotification).toHaveBeenCalledTimes(1);
    const writeCall = writeNotificationPort.writeNotification.mock.calls[0][0];
    expect(writeCall.alarm_event_id).toBe('alarm-2');
    expect(writeCall.ward_id).toBe(5);
    expect(Date.parse(writeCall.timestamp)).not.toBeNaN();
  });

  it('should throw when resolution command is missing parameters', async () => {
    notifyResolutionPort.notifyAlarmResolution.mockResolvedValue(undefined);

    await expect(
      service.notifyAlarmResolution({ alarmId: '', wardId: 0 }),
    ).rejects.toThrow("Can't write notification without parameters");
    expect(writeNotificationPort.writeNotification).toHaveBeenCalledTimes(0);
  });
});