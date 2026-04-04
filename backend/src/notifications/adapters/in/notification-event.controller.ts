import { Controller, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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

  @OnEvent('event.alarm')
  async handleAlarmEvent(payload: AlarmEventDto) {
    await this.notifyService.notifyAlarmWard({ alarm: payload });
  }
}
