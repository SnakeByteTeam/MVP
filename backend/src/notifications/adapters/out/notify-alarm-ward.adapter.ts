import { Inject, Injectable } from '@nestjs/common';
import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { NotifyAlarmWardCmd } from 'src/notifications/application/commands/notify-alarm-ward.command';
import { NotifyAlarmWardPort } from 'src/notifications/application/ports/out/notify-alarm-ward.port';
import {
  NOTIFY_ALARM_WARD_REPO_PORT,
  type NotifyAlarmWardRepoPort,
} from 'src/notifications/application/repository/notify-alarm-ward.repository';

@Injectable()
export class NotifyAlarmWardAdapter implements NotifyAlarmWardPort {
  constructor(
    @Inject(NOTIFY_ALARM_WARD_REPO_PORT)
    private readonly notifyRepo: NotifyAlarmWardRepoPort,
  ) {}

  notifyAlarmWard(cmd: NotifyAlarmWardCmd): Promise<void> {
    if (!cmd?.alarm)
      throw new Error('Cannot notify alarm ward without informations');

    const checkAlarmDto: CheckAlarmRuleResDto = CheckAlarmRuleResDto.fromDomain(
      cmd.alarm,
    );

    return this.notifyRepo.notifyAlarmWard(cmd.alarm.ward_id, checkAlarmDto);
  }
}
