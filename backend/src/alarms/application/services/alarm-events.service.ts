import { Inject, Injectable } from '@nestjs/common';
import { ResolveAlarmEventCmd } from '../commands/resolve-alarm-event-cmd';
import { ResolveAlarmEventUseCase } from '../ports/in/resolve-active-alarm.use-case';
import {
  RESOLVE_ALARM_EVENT_PORT,
  ResolveAlarmEventPort,
} from '../ports/out/resolve-alarm-event-port.interface';
import { GetAllManagedAlarmEventsByUserIdUseCase } from '../ports/in/get-all-managed-alarm-events-by-user-id-use-case.interface';
import { GetAllManagedAlarmEventsByUserIdCmd } from '../commands/get-all-managed-alarm-events-by-user-id-cmd';
import { GetAllAlarmEventsUseCase } from '../ports/in/get-all-alarm-events-use-case.interface';
import { AlarmEvent } from '../../domain/models/alarm-event.model';
import {
  GET_ALL_ALARM_EVENTS_PORT,
  GetAllAlarmEventsPort,
} from '../ports/out/get-all-alarm-events.port';
import {
  GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
  GetAllManagedAlarmEventsByUserIdPort,
} from '../ports/out/get-all-managed-alarm-events-by-user-id-port.interface';
import { GetAllAlarmEventsCmd } from '../commands/get-all-alarm-events-cmd';
import { GetAllUnmanagedAlarmEventsByUserIdUseCase } from '../ports/in/get-all-unmanaged-alarm-events-by-user-id-use-case.interface';
import { GetAllUnmanagedAlarmEventsByUserIdCmd } from '../commands/get-all-unmanaged-alarm-events-by-user-id-cmd';
import {
  GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT,
  GetAllUnmanagedAlarmEventsByUserIdPort,
} from '../ports/out/get-all-unmanaged-alarm-events-by-user-id-port.interface';
import { GetAlarmEventByIdUseCase } from '../ports/in/get-alarm-event-by-id-use-case.interface';
import { GetAlarmEventByIdCmd } from '../commands/get-alarm-event-by-id-cmd';
import {
  GET_ALARM_EVENT_BY_ID_PORT,
  GetAlarmEventByIdPort,
} from '../ports/out/get-alarm-event-by-id-port.interface';

@Injectable()
export class AlarmEventsService
  implements
    GetAllAlarmEventsUseCase,
    GetAllManagedAlarmEventsByUserIdUseCase,
    GetAllUnmanagedAlarmEventsByUserIdUseCase,
    GetAlarmEventByIdUseCase,
    ResolveAlarmEventUseCase
{
  constructor(
    @Inject(GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_PORT)
    private readonly getAllManagedAlarmEventsByUserIdPort: GetAllManagedAlarmEventsByUserIdPort,

    @Inject(GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_PORT)
    private readonly getAllUnmanagedAlarmEventsByUserIdPort: GetAllUnmanagedAlarmEventsByUserIdPort,

    @Inject(GET_ALARM_EVENT_BY_ID_PORT)
    private readonly getAlarmEventByIdPort: GetAlarmEventByIdPort,

    @Inject(GET_ALL_ALARM_EVENTS_PORT)
    private readonly getAllAlarmEventsPort: GetAllAlarmEventsPort,

    @Inject(RESOLVE_ALARM_EVENT_PORT)
    private readonly resolveAlarmEventPort: ResolveAlarmEventPort,
  ) {}

  getAlarmEventById(req: GetAlarmEventByIdCmd): Promise<AlarmEvent | null> {
    return this.getAlarmEventByIdPort.getAlarmEventById(req);
  }

  async getAllAlarmEvents(req: GetAllAlarmEventsCmd): Promise<AlarmEvent[]> {
    return await this.getAllAlarmEventsPort.getAllAlarmEvents(req);
  }

  async getAllManagedAlarmEventsByUserId(
    req: GetAllManagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    return await this.getAllManagedAlarmEventsByUserIdPort.getAllManagedAlarmEventsByUserId(
      req,
    );
  }

  async getAllUnmanagedAlarmEventsByUserId(
    req: GetAllUnmanagedAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    return await this.getAllUnmanagedAlarmEventsByUserIdPort.getAllUnmanagedAlarmEventsByUserId(
      req,
    );
  }

  async resolveAlarmEvent(req: ResolveAlarmEventCmd): Promise<void> {
    return await this.resolveAlarmEventPort.resolveAlarmEvent(req);
  }
}
