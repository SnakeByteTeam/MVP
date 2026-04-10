import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { NotificationRepositoryImpl } from './notification-repository-impl';
import { NotificationsRepositoryImpl } from './notifications-repository-impl';
import { NotificationsGateway } from '../websocket/websocket-gateway';

describe('NotificationsRepositoryImpl', () => {
  let repository: NotificationsRepositoryImpl;
  let notificationsGateway: jest.Mocked<Pick<NotificationsGateway, 'notifyAlarmWard' | 'notifyAlarmResolution'>>;
  let notificationRepository: jest.Mocked<
    Pick<NotificationRepositoryImpl, 'writeNotification'>
  >;

  beforeEach(() => {
    notificationsGateway = {
      notifyAlarmWard: jest.fn(),
      notifyAlarmResolution: jest.fn(),
    };

    notificationRepository = {
      writeNotification: jest.fn(),
    };

    repository = new NotificationsRepositoryImpl(
      notificationsGateway as unknown as NotificationsGateway,
      notificationRepository as unknown as NotificationRepositoryImpl,
    );
  });

  it('should delegate notifyAlarmWard to notificationsGateway', async () => {
    const alarm = {
      alarmRuleId: 'alarm-1',
      wardId: 9,
      alarmEventId: 'event-1',
    } as CheckAlarmRuleResDto;
    notificationsGateway.notifyAlarmWard.mockResolvedValue(undefined);

    await repository.notifyAlarmWard(9, alarm);

    expect(notificationsGateway.notifyAlarmWard).toHaveBeenCalledWith(9, alarm);
  });

  it('should delegate notifyAlarmResolution to notificationsGateway', async () => {
    notificationsGateway.notifyAlarmResolution.mockResolvedValue(undefined);

    await repository.notifyAlarmResolution('alarm-2', 11);

    expect(notificationsGateway.notifyAlarmResolution).toHaveBeenCalledWith(
      'alarm-2',
      11,
    );
  });

  it('should delegate writeNotification to notificationRepository', async () => {
    notificationRepository.writeNotification.mockResolvedValue(true);

    const result = await repository.writeNotification(
      3,
      'alarm-rule-3',
      '2026-04-10T08:00:00.000Z',
    );

    expect(notificationRepository.writeNotification).toHaveBeenCalledWith(
      3,
      'alarm-rule-3',
      '2026-04-10T08:00:00.000Z',
    );
    expect(result).toBe(true);
  });
});