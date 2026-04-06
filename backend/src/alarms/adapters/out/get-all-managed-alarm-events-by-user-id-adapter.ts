import { Inject } from '@nestjs/common';
import { GetAllManagedAlarmEventsByUserIdCmd } from '../../application/commands/get-all-managed-alarm-events-by-user-id-cmd';
import { GetAllManagedAlarmEventsByUserIdPort } from '../../application/ports/out/get-all-managed-alarm-events-by-user-id-port.interface';
import { AlarmEvent } from '../../domain/models/alarm-event.model';
import {
  GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_REPOSITORY,
  GetAllManagedAlarmEventsByUserIdRepository,
} from '../../application/repository/get-all-managed-alarm-events-by-user-id-repository.interface';

export class GetAllManagedAlarmEventsByUserIdAdapter implements GetAllManagedAlarmEventsByUserIdPort {
  constructor(
    @Inject(GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_REPOSITORY)
    private readonly getAllManagedAlarmEventsByUserIdRepository: GetAllManagedAlarmEventsByUserIdRepository,
  ) { }

  async getAllManagedAlarmEventsByUserId(
    req: GetAllManagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    const managedAlarmEvents =
      await this.getAllManagedAlarmEventsByUserIdRepository.getAllManagedAlarmEventsByUserId(
        req.id,
        req.limit,
        req.offset,
      );

    return managedAlarmEvents.map(
      (managedAlarmEvent) =>
        new AlarmEvent(
          managedAlarmEvent.id,
          managedAlarmEvent.room_name + ' ' + managedAlarmEvent.device_name,
          managedAlarmEvent.alarm_rule_id,
          managedAlarmEvent.alarm_name,
          managedAlarmEvent.priority,
          managedAlarmEvent.activation_time,
          managedAlarmEvent.resolution_time,
          managedAlarmEvent.user_id,
          managedAlarmEvent.user_username,
        ),
    );
  }
}
