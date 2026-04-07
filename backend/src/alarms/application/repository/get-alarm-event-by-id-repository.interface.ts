import { AlarmEventEntity } from "../../infrastructure/entities/alarm-event-entity";

export interface GetAlarmEventByIdRepository {
    getAlarmEventById(id: string): Promise<AlarmEventEntity | null>
}

export const GET_ALARM_EVENT_BY_ID_REPOSITORY = 'GET_ALARM_EVENT_BY_ID_REPOSITORY';
