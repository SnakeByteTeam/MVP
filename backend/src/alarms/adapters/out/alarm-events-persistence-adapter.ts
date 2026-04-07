import { Inject } from '@nestjs/common';
import { CreateAlarmEventCmd } from '../../application/commands/create-alarm-event-cmd';
import { GetAlarmEventByIdCmd } from '../../application/commands/get-alarm-event-by-id-cmd';
import { GetAllAlarmEventsCmd } from '../../application/commands/get-all-alarm-events-cmd';
import { GetAllManagedAlarmEventsByUserIdCmd } from '../../application/commands/get-all-managed-alarm-events-by-user-id-cmd';
import { GetAllUnmanagedAlarmEventsByUserIdCmd } from '../../application/commands/get-all-unmanaged-alarm-events-by-user-id-cmd';
import { ResolveAlarmEventCmd } from '../../application/commands/resolve-alarm-event-cmd';
import { CreateAlarmEventPort } from '../../application/ports/out/create-alarm-event-port.interface';
import { GetAlarmEventByIdPort } from '../../application/ports/out/get-alarm-event-by-id-port.interface';
import { GetAllAlarmEventsPort } from '../../application/ports/out/get-all-alarm-events.port';
import { GetAllManagedAlarmEventsByUserIdPort } from '../../application/ports/out/get-all-managed-alarm-events-by-user-id-port.interface';
import { GetAllUnmanagedAlarmEventsByUserIdPort } from '../../application/ports/out/get-all-unmanaged-alarm-events-by-user-id-port.interface';
import { ResolveAlarmEventPort } from '../../application/ports/out/resolve-alarm-event-port.interface';
import {
  ALARM_EVENTS_REPOSITORY,
  AlarmEventsRepository,
} from '../../application/repository/alarm-events-repository.interface';
import { AlarmEvent } from '../../domain/models/alarm-event.model';

export class AlarmEventsPersistenceAdapter
  implements
    CreateAlarmEventPort,
    GetAlarmEventByIdPort,
    GetAllAlarmEventsPort,
    GetAllManagedAlarmEventsByUserIdPort,
    GetAllUnmanagedAlarmEventsByUserIdPort,
    ResolveAlarmEventPort
{
  constructor(
    @Inject(ALARM_EVENTS_REPOSITORY)
    private readonly alarmEventsRepository: AlarmEventsRepository,
  ) {}

  async getAlarmEventById(
    req: GetAlarmEventByIdCmd,
  ): Promise<AlarmEvent | null> {
    const alarmEvent = await this.alarmEventsRepository.getAlarmEventById(
      req.id,
    );

    if (alarmEvent == null) {
      return null;
    }

    return new AlarmEvent(
      alarmEvent.id,
      alarmEvent.plant_name +
        ' - ' +
        alarmEvent.room_name +
        ' - ' +
        alarmEvent.device_name,
      alarmEvent.alarm_rule_id,
      alarmEvent.alarm_name,
      alarmEvent.priority,
      alarmEvent.activation_time,
      alarmEvent.resolution_time,
      alarmEvent.user_id,
      alarmEvent.user_username,
    );
  }
  async getAllAlarmEvents(req: GetAllAlarmEventsCmd): Promise<AlarmEvent[]> {
    const alarmEvents = await this.alarmEventsRepository.getAllAlarmEvents(
      req.limit,
      req.offset,
    );
    return alarmEvents.map(
      (alarmEvent) =>
        new AlarmEvent(
          alarmEvent.id,
          alarmEvent.room_name + ' ' + alarmEvent.device_name,
          alarmEvent.alarm_rule_id,
          alarmEvent.alarm_name,
          alarmEvent.priority,
          alarmEvent.activation_time,
          alarmEvent.resolution_time,
          alarmEvent.user_id,
          alarmEvent.user_username,
        ),
    );
  }
  async getAllManagedAlarmEventsByUserId(
    req: GetAllManagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    const managedAlarmEvents =
      await this.alarmEventsRepository.getAllManagedAlarmEventsByUserId(
        req.id,
        req.limit,
        req.offset,
      );

    return managedAlarmEvents.map(
      (managedAlarmEvent) =>
        new AlarmEvent(
          managedAlarmEvent.id,
          managedAlarmEvent.plant_name +
            ' - ' +
            managedAlarmEvent.room_name +
            ' - ' +
            managedAlarmEvent.device_name,
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
  async getAllUnmanagedAlarmEventsByUserId(
    req: GetAllUnmanagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    const unmanagedAlarmEvents =
      await this.alarmEventsRepository.getAllUnmanagedAlarmEventsByUserId(
        req.id,
        req.limit,
        req.offset,
      );
    return unmanagedAlarmEvents.map(
      (unmanagedAlarmEvent) =>
        new AlarmEvent(
          unmanagedAlarmEvent.id,
          unmanagedAlarmEvent.plant_name +
            ' - ' +
            unmanagedAlarmEvent.room_name +
            ' - ' +
            unmanagedAlarmEvent.device_name,
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
  async resolveAlarmEvent(req: ResolveAlarmEventCmd): Promise<void> {
    return await this.alarmEventsRepository.resolveAlarmEvent(
      req.alarmId,
      req.userId,
    );
  }
  async createAlarmEvent(req: CreateAlarmEventCmd): Promise<void> {
    return await this.alarmEventsRepository.createAlarmEvent(
      req.alarmRuleId,
      req.activationTime,
    );
  }
}
