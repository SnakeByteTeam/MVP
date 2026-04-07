import { Inject } from "@nestjs/common";
import { GetAlarmEventByIdCmd } from "../../application/commands/get-alarm-event-by-id-cmd";
import { GetAlarmEventByIdPort } from "../../application/ports/out/get-alarm-event-by-id-port.interface";
import { AlarmEvent } from "../../domain/models/alarm-event.model";
import { GET_ALARM_EVENT_BY_ID_REPOSITORY, GetAlarmEventByIdRepository } from "../../application/repository/get-alarm-event-by-id-repository.interface";

export class GetAlarmEventByIdAdapter implements GetAlarmEventByIdPort {
    constructor(
        @Inject(GET_ALARM_EVENT_BY_ID_REPOSITORY) private readonly getAlarmEventByIdRepository: GetAlarmEventByIdRepository
    ){}
    async getAlarmEventById(req: GetAlarmEventByIdCmd): Promise<AlarmEvent | null> {
        const alarmEvent = await this.getAlarmEventByIdRepository.getAlarmEventById(req.id);

        if (alarmEvent==null){
            return null
        }

        return new AlarmEvent(
            alarmEvent.id,
            alarmEvent.plant_name + ' - ' + alarmEvent.room_name + ' - ' + alarmEvent.device_name,
            alarmEvent.alarm_rule_id,
            alarmEvent.alarm_name,
            alarmEvent.priority,
            alarmEvent.activation_time,
            alarmEvent.resolution_time,
            alarmEvent.user_id,
            alarmEvent.user_username
        )
    }
}
