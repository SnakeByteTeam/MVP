import { Inject } from '@nestjs/common';
import { GetAllAlarmEventsPort } from '../../application/ports/out/get-all-alarm-events.port';
import { AlarmEvent } from '../../domain/models/alarm-event.model';
import {
  GET_ALL_ALARM_EVENTS_REPOSITORY,
  GetAllAlarmEventsRepository,
} from '../../application/repository/get-all-alarm-events-repository.interface';

export class GetAllAlarmEventsAdapter implements GetAllAlarmEventsPort {
  constructor(
    @Inject(GET_ALL_ALARM_EVENTS_REPOSITORY)
    private readonly getAllAlarmEventsRepository: GetAllAlarmEventsRepository,
  ) {}

  async getAllAlarmEvents(): Promise<AlarmEvent[]> {
    const alarmEvents =
      await this.getAllAlarmEventsRepository.getAllAlarmEvents();
    return alarmEvents.map(
      (alarmEvent) =>
        new AlarmEvent(
          alarmEvent.id,
          alarmEvent.alarm_rule_id,
          alarmEvent.alarm_name,
          alarmEvent.priority,
          alarmEvent.activation_time,
          alarmEvent.resolution_time,
          alarmEvent.user_id
        ),
    );
  }
}
