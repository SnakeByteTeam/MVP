import { NotificationsAdapter } from 'src/notifications/adapters/out/notifications.adapter';
import {
  NOTIFICATIONS_REPOSITORY_PORT,
  type NotificationsRepositoryPort,
} from 'src/notifications/application/repository/notifications.repository';
import { NotifyAlarmWardCmd } from 'src/notifications/application/commands/notify-alarm-ward.command';
import { NotifyAlarmResolutionCmd } from 'src/notifications/application/commands/notify-alarm-resolution.command';
import { WriteNotificationCmd } from 'src/notifications/application/commands/write-notification.command';
import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';

describe('NotificationsAdapter', () => {
  let adapter: NotificationsAdapter;
  let notificationsRepository: jest.Mocked<NotificationsRepositoryPort>;

  beforeEach(() => {
    notificationsRepository = {
      notifyAlarmWard: jest.fn(),
      notifyAlarmResolution: jest.fn(),
      writeNotification: jest.fn(),
    } as any;

    adapter = new NotificationsAdapter(notificationsRepository);
  });

  describe('notifyAlarmWard', () => {
    it('should call notifyAlarmWard on repository with correct parameters', async () => {
      const mockAlarm = {
        rule_id: 'rule-1',
        ward_id: 5,
        priority: 1,
        description: 'Test Alarm',
      } as any;

      const cmd: NotifyAlarmWardCmd = {
        alarm: mockAlarm,
      };

      notificationsRepository.notifyAlarmWard.mockResolvedValue(undefined);

      await adapter.notifyAlarmWard(cmd);

      expect(notificationsRepository.notifyAlarmWard).toHaveBeenCalledTimes(1);
      const callArgs = notificationsRepository.notifyAlarmWard.mock.calls[0];
      expect(callArgs[0]).toBe(5); // ward_id
      expect(callArgs[1]).toBeInstanceOf(CheckAlarmRuleResDto);
    });

    it('should throw error when cmd is null', async () => {
      const cmd: NotifyAlarmWardCmd = { alarm: null } as any;

      await expect(adapter.notifyAlarmWard(cmd)).rejects.toThrow(
        'Cannot notify alarm ward without informations',
      );
    });

    it('should throw error when alarm is missing', async () => {
      const cmd: NotifyAlarmWardCmd = {} as any;

      await expect(adapter.notifyAlarmWard(cmd)).rejects.toThrow(
        'Cannot notify alarm ward without informations',
      );
    });

    it('should throw error when cmd is undefined', async () => {
      await expect(adapter.notifyAlarmWard(undefined as any)).rejects.toThrow(
        'Cannot notify alarm ward without informations',
      );
    });
  });

  describe('notifyAlarmResolution', () => {
    it('should call notifyAlarmResolution on repository', async () => {
      const cmd: NotifyAlarmResolutionCmd = {
        alarmId: 'alarm-123',
        wardId: 5,
      };

      notificationsRepository.notifyAlarmResolution.mockResolvedValue(
        undefined,
      );

      await adapter.notifyAlarmResolution(cmd);

      expect(
        notificationsRepository.notifyAlarmResolution,
      ).toHaveBeenCalledWith('alarm-123', 5);
      expect(
        notificationsRepository.notifyAlarmResolution,
      ).toHaveBeenCalledTimes(1);
    });

    it('should handle notifyAlarmResolution errors gracefully', async () => {
      const cmd: NotifyAlarmResolutionCmd = {
        alarmId: 'alarm-456',
        wardId: 10,
      };

      notificationsRepository.notifyAlarmResolution.mockRejectedValue(
        new Error('Repository error'),
      );

      await expect(adapter.notifyAlarmResolution(cmd)).rejects.toThrow(
        'Repository error',
      );
    });

    it('should pass correct parameters regardless of case', async () => {
      const cmd: NotifyAlarmResolutionCmd = {
        alarmId: 'ALARM-789',
        wardId: 3,
      };

      notificationsRepository.notifyAlarmResolution.mockResolvedValue(
        undefined,
      );

      await adapter.notifyAlarmResolution(cmd);

      expect(
        notificationsRepository.notifyAlarmResolution,
      ).toHaveBeenCalledWith('ALARM-789', 3);
    });
  });

  describe('writeNotification', () => {
    it('should write notification successfully', async () => {
      const cmd: WriteNotificationCmd = {
        ward_id: 5,
        alarm_event_id: 'event-123',
        timestamp: new Date('2026-04-09T10:00:00Z').toISOString(),
      };

      notificationsRepository.writeNotification.mockResolvedValue(true);

      const result = await adapter.writeNotification(cmd);

      expect(result).toBe(true);
      expect(notificationsRepository.writeNotification).toHaveBeenCalledWith(
        5,
        'event-123',
        cmd.timestamp,
      );
    });

    it('should return false when repository returns false', async () => {
      const cmd: WriteNotificationCmd = {
        ward_id: 5,
        alarm_event_id: 'event-456',
        timestamp: new Date('2026-04-09T10:00:00Z').toISOString(),
      };

      notificationsRepository.writeNotification.mockResolvedValue(false);

      const result = await adapter.writeNotification(cmd);

      expect(result).toBe(false);
    });

    it('should throw error when alarm_event_id is missing', async () => {
      const cmd: WriteNotificationCmd = {
        ward_id: 5,
        alarm_event_id: null as any,
        timestamp: new Date('2026-04-09T10:00:00Z').toISOString(),
      };

      await expect(adapter.writeNotification(cmd)).rejects.toThrow(
        "Can' write notification without parameteres",
      );
    });

    it('should throw error when timestamp is missing', async () => {
      const cmd: WriteNotificationCmd = {
        ward_id: 5,
        alarm_event_id: 'event-789',
        timestamp: null as any,
      };

      await expect(adapter.writeNotification(cmd)).rejects.toThrow(
        "Can' write notification without parameteres",
      );
    });

    it('should throw error when ward_id is null', async () => {
      const cmd: WriteNotificationCmd = {
        ward_id: null as any,
        alarm_event_id: 'event-101',
        timestamp: new Date('2026-04-09T10:00:00Z').toISOString(),
      };

      await expect(adapter.writeNotification(cmd)).rejects.toThrow(
        "Can' write notification without parameteres",
      );
    });

    it('should throw error when ward_id is undefined', async () => {
      const cmd: WriteNotificationCmd = {
        ward_id: undefined as any,
        alarm_event_id: 'event-102',
        timestamp: new Date('2026-04-09T10:00:00Z').toISOString(),
      };

      await expect(adapter.writeNotification(cmd)).rejects.toThrow(
        "Can' write notification without parameteres",
      );
    });

    it('should throw error when cmd is undefined', async () => {
      await expect(adapter.writeNotification(undefined as any)).rejects.toThrow(
        "Can' write notification without parameteres",
      );
    });

    it('should throw error when cmd is null', async () => {
      await expect(adapter.writeNotification(null as any)).rejects.toThrow(
        "Can' write notification without parameteres",
      );
    });
  });
});
