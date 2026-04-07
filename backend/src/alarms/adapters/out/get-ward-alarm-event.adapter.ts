import { Inject } from "@nestjs/common";
import { GetWardAlarmEventCmd } from "src/alarms/application/commands/get-ward-alarm-event.command";
import { GetWardAlarmEventPort } from "src/alarms/application/ports/out/get-ward-alarm-event.port";
import { GET_WARD_ALARM_EVENT_REPO_PORT, type GetWardAlarmEventRepoPort } from "src/alarms/application/repository/get-ward-alarm-rule.repository";

export class GetWardAlarmEventAdapter implements GetWardAlarmEventPort {
    constructor(
        @Inject(GET_WARD_ALARM_EVENT_REPO_PORT)
        private readonly repoPort: GetWardAlarmEventRepoPort
    ) {}

    async getWardAlarmEvent(cmd: GetWardAlarmEventCmd): Promise<number> {
        if(!cmd || !cmd.alarmId) {
            throw new Error('Invalid command: alarmId is required');
        }
        return await this.repoPort.getWardAlarmEvent(cmd.alarmId);
    }
}