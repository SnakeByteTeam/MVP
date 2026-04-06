import { Controller, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CheckAlarm } from 'src/alarms/domain/models/check-alarm';
import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import {
  NOTIFY_ALARM_WARD_USECASE,
  type NotifyAlarmWardUseCase,
} from 'src/notifications/application/ports/in/notify-alarm-ward.usecase';

@Controller()
export class EventNotificationController {
  constructor(
    @Inject(NOTIFY_ALARM_WARD_USECASE)
    private readonly notifyService: NotifyAlarmWardUseCase,
  ) {}

  @OnEvent('alarm.activated')
  async handleAlarmEvent(payload: CheckAlarmRuleResDto) {
    if (!payload || !payload.alarmEventId) return;

    console.log('[NOTIFICATION CONTROLLER] Allarme ricevuto, notifico');

    try {
      const alarm: CheckAlarm = CheckAlarmRuleResDto.toDomain(payload);
      await this.notifyService.notifyAlarmWard({ alarm: alarm });
    } catch (error) {
      console.error(
        '[NOTIFICATION CONTROLLER] Errore durante notifica allarme:',
        error,
      );
    }
  }
}
