import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { NotifyAlarmResolutionUseCase } from 'src/notifications/application/ports/in/notify-alarm-resolution.usecase';
import { NotifyAlarmWardUseCase } from 'src/notifications/application/ports/in/notify-alarm-ward.usecase';
import { EventNotificationController } from './notification-event.controller';

describe('EventNotificationController', () => {
  let controller: EventNotificationController;
  let notifyService: jest.Mocked<NotifyAlarmWardUseCase>;
  let notifyResolutionService: jest.Mocked<NotifyAlarmResolutionUseCase>;

  beforeEach(() => {
    notifyService = {
      notifyAlarmWard: jest.fn(),
    };
    notifyResolutionService = {
      notifyAlarmResolution: jest.fn(),
    };

    controller = new EventNotificationController(
      notifyService,
      notifyResolutionService,
    );
  });

  it('should ignore activation event when payload is empty', async () => {
    await controller.handleAlarmEvent(
      undefined as unknown as CheckAlarmRuleResDto,
    );

    expect(notifyService.notifyAlarmWard).toHaveBeenCalledTimes(0);
  });

  it('should map and notify activation event', async () => {
    notifyService.notifyAlarmWard.mockResolvedValue(undefined);

    const payload: CheckAlarmRuleResDto = {
      alarmRuleId: 'rule-10',
      wardId: 8,
      alarmEventId: 'event-10',
    };

    await controller.handleAlarmEvent(payload);

    expect(notifyService.notifyAlarmWard).toHaveBeenCalledTimes(1);
    expect(notifyService.notifyAlarmWard).toHaveBeenCalledWith({
      alarm: expect.objectContaining({
        alarm_rule_id: 'rule-10',
        ward_id: 8,
        alarm_event_id: 'event-10',
      }),
    });
  });

  it('should swallow errors during activation notification', async () => {
    notifyService.notifyAlarmWard.mockRejectedValue(new Error('ws down'));

    await expect(
      controller.handleAlarmEvent({
        alarmRuleId: 'rule-10',
        wardId: 8,
        alarmEventId: 'event-10',
      }),
    ).resolves.toBeUndefined();
  });

  it('should ignore resolved event when payload has no alarmEventId', async () => {
    await controller.handleAlarmResolvedEvent({
      alarmEventId: '',
      wardId: 8,
    });

    expect(notifyResolutionService.notifyAlarmResolution).toHaveBeenCalledTimes(
      0,
    );
  });

  it('should notify resolved event', async () => {
    notifyResolutionService.notifyAlarmResolution.mockResolvedValue(undefined);

    await controller.handleAlarmResolvedEvent({
      alarmEventId: 'event-20',
      wardId: 9,
    });

    expect(notifyResolutionService.notifyAlarmResolution).toHaveBeenCalledWith({
      alarmId: 'event-20',
      wardId: 9,
    });
  });
});
