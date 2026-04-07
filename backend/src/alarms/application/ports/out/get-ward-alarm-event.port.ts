import { GetWardAlarmEventCmd } from "../../commands/get-ward-alarm-event.command";

export interface GetWardAlarmEventPort {
    getWardAlarmEvent(cmd: GetWardAlarmEventCmd): Promise<number>;
}

export const GET_WARD_ALARM_EVENT_PORT = Symbol('GetWardAlarmEventPort');