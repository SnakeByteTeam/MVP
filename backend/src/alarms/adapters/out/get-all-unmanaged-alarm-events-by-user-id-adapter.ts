import { Inject } from '@nestjs/common';
import {
  GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_REPOSITORY,
  GetAllUnmanagedAlarmEventsByUserIdRepository,
} from '../../application/repository/get-all-unmanaged-alarm-events-by-user-id-repository.interface';
import { GetAllUnmanagedAlarmEventsByUserIdCmd } from '../../application/commands/get-all-unmanaged-alarm-events-by-user-id-cmd';
import { AlarmEvent } from '../../domain/models/alarm-event.model';

export class GetAllUnmanagedAlarmEventsByUserIdAdapter {
  constructor(
    @Inject(GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_REPOSITORY)
    private readonly getAllUnmanagedAlarmEventsByUserIdRepository: GetAllUnmanagedAlarmEventsByUserIdRepository,
  ) { }

  async getAllUnmanagedAlarmEventsByUserId(
    req: GetAllUnmanagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    const unmanagedAlarmEvents =
      await this.getAllUnmanagedAlarmEventsByUserIdRepository.getAllUnmanagedAlarmEventsByUserId(
        req.id,
        req.limit,
        req.offset,
      );
    return unmanagedAlarmEvents.map(
      (unmanagedAlarmEvent) =>
        new AlarmEvent(
          unmanagedAlarmEvent.id,
          unmanagedAlarmEvent.room_name + ' ' + unmanagedAlarmEvent.device_name,
          unmanagedAlarmEvent.alarm_rule_id,
          unmanagedAlarmEvent.alarm_name,
          unmanagedAlarmEvent.priority,
          unmanagedAlarmEvent.activation_time,
          unmanagedAlarmEvent.resolution_time,
          unmanagedAlarmEvent.user_id,
          unmanagedAlarmEvent.user_username,
        ),
    );
  }
}
