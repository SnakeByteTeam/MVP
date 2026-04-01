import { Inject, Injectable } from "@nestjs/common";
import { NotifyAlarmWardUseCase } from "../ports/in/notify-alarm-ward.usecase";
import { WRITE_NOTIFICATION_PORT, type WriteNotificationPort } from "../ports/out/write-notification.port";
import { NOTIFY_ALARM_WARD_PORT, type NotifyAlarmWardPort } from "../ports/out/notify-alarm-ward.port";
import { NotifyAlarmWardCmd } from "../commands/notify-alarm-ward.command";

@Injectable()
export class NotificationService implements NotifyAlarmWardUseCase{

    constructor(
        @Inject(WRITE_NOTIFICATION_PORT) 
        private readonly writePort: WriteNotificationPort,
        @Inject(NOTIFY_ALARM_WARD_PORT)
        private readonly notifyPort: NotifyAlarmWardPort
        
        private readonly getWardIdPort: GetWardIdPort
    ) {}

    async notifyAlarmWard(cmd: NotifyAlarmWardCmd): Promise<void> {
        if(!cmd?.alarm) throw new Error('AlarmEventDto is null');

        cmd.wardId = await this.getWardIdPort(cmd.alarm.alarmId);

        await this.notifyPort.notifyAlarmWard(cmd);
    }
}