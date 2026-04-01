import { Inject, Injectable } from '@nestjs/common';
import { ResolveAlarmEventCmd } from '../commands/resolve-alarm-event-cmd';
import { ResolveAlarmEventUseCase } from '../ports/in/resolve-active-alarm.use-case';
import {
  RESOLVE_ALARM_EVENT_PORT,
  ResolveAlarmEventPort,
} from '../ports/out/resolve-alarm-event-port.interface';
import { GetAllAlarmEventsByUserIdUseCase } from '../ports/in/get-all-alarms-events-by-user-id-use-case.interface';
import { GetAllAlarmEventsByUserIdCmd } from '../commands/get-all-alarm-events-by-user-id-cmd';
import { GetAllAlarmEventsUseCase } from '../ports/in/get-all-alarm-events-use-case.interface';
import { AlarmEvent } from '../../domain/models/alarm-event.model';
import {
  GET_ALL_ALARM_EVENTS_PORT,
  GetAllAlarmEventsPort,
} from '../ports/out/get-all-alarm-events.port';
import {
  GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT,
  GetAllAlarmEventsByUserIdPort,
} from '../ports/out/get-all-alarms-events-by-user-id-port.interface';

@Injectable()
export class AlarmEventsService
  implements
    GetAllAlarmEventsUseCase,
    GetAllAlarmEventsByUserIdUseCase,
    ResolveAlarmEventUseCase
{
  constructor(
    @Inject(GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT)
    private readonly getAllAlarmEventsByUserIdPort: GetAllAlarmEventsByUserIdPort,

    @Inject(GET_ALL_ALARM_EVENTS_PORT)
    private readonly getAllAlarmEventsPort: GetAllAlarmEventsPort,

    @Inject(RESOLVE_ALARM_EVENT_PORT)
    private readonly resolveAlarmEventPort: ResolveAlarmEventPort,
  ) {}

  async getAllAlarmEvents(): Promise<AlarmEvent[]> {
    return await this.getAllAlarmEventsPort.getAllAlarmEvents();
  }

  async getAllAlarmEventsByUserId(
    req: GetAllAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    return await this.getAllAlarmEventsByUserIdPort.getAllAlarmEventsByUserId(
      req,
    );
  }

  async resolveAlarmEvent(req: ResolveAlarmEventCmd): Promise<void> {
    return await this.resolveAlarmEventPort.resolveAlarmEvent(req);
  }
}
