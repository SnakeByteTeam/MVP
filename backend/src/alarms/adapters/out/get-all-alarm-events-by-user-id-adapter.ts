import { Inject } from '@nestjs/common';
import { GetAllAlarmEventsByUserIdCmd } from '../../application/commands/get-all-alarm-events-by-user-id-cmd';
import { GetAllAlarmEventsByUserIdPort } from '../../application/ports/out/get-all-alarms-events-by-user-id-port.interface';
import { AlarmEvent } from '../../domain/models/alarm-event.model';
import {
  GET_ALL_ALARM_EVENTS_BY_USER_ID_REPOSITORY,
  GetAllAlarmEventsByUserIdRepository,
} from '../../application/repository/get-all-alarm-events-by-user-id-repository.interface';

export class GetAllAlarmEventsByUserIdAdapter implements GetAllAlarmEventsByUserIdPort {
  constructor(
    @Inject(GET_ALL_ALARM_EVENTS_BY_USER_ID_REPOSITORY)
    private readonly getAllAlarmEventsByUserIdRepository: GetAllAlarmEventsByUserIdRepository,
  ) { }

  async getAllAlarmEventsByUserId(
    req: GetAllAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    const alarmEvents =
      await this.getAllAlarmEventsByUserIdRepository.getAllAlarmEventsByUserId(
        req.id,
        req.limit,
        req.offset,
      );

    return alarmEvents.map(
      (alarmEvent) =>
        new AlarmEvent(
          alarmEvent.id,
          alarmEvent.room_name + ' ' + alarmEvent.device_name,
          alarmEvent.device_id,
          alarmEvent.alarm_rule_id,
          alarmEvent.alarm_name,
          alarmEvent.priority,
          alarmEvent.activation_time,
          alarmEvent.resolution_time,
          alarmEvent.user_id,
          alarmEvent.user_username
        ),
    );
  }
}
