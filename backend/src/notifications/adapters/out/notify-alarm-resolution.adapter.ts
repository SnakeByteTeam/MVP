import { Inject } from "@nestjs/common";
import { NotifyAlarmResolutionCmd } from "src/notifications/application/commands/notify-alarm-resolution.command";
import { NotifyAlarmResolutionPort } from "src/notifications/application/ports/out/notify-alarm-resolution.port";
import { NOTIFY_ALARM_RESOLUTION_REPO_PORT, type NotifyAlarmResolutionRepoPort } from "src/notifications/application/repository/notify-alarm-resolution.repository";

export class NotifyAlarmResolutionAdapter implements NotifyAlarmResolutionPort {
    constructor(
        @Inject(NOTIFY_ALARM_RESOLUTION_REPO_PORT)
        private readonly notifyResolutionRepo: NotifyAlarmResolutionRepoPort
    ) {}

    async notifyAlarmResolution(cmd: NotifyAlarmResolutionCmd): Promise<void> {
        await this.notifyResolutionRepo.notifyAlarmResolution(cmd.alarmId, cmd.wardId);
    }   
}