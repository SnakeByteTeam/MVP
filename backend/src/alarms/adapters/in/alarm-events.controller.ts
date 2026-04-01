import { Controller, Get, Post, Param, Inject } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ResolveAlarmEventCmd } from '../../application/commands/resolve-alarm-event-cmd';
import {
  RESOLVE_ALARM_EVENT_USE_CASE,
  ResolveAlarmEventUseCase,
} from '../../application/ports/in/resolve-active-alarm.use-case';
import { GetAllAlarmEventsByUserIdResDto } from '../../infrastructure/dtos/out/get-all-alarm-events-by-user-id-res-dto';
import {
  GET_ALL_ALARM_EVENTS_BY_USER_ID_USE_CASE,
  GetAllAlarmEventsByUserIdUseCase,
} from '../../application/ports/in/get-all-alarms-events-by-user-id-use-case.interface';
import { GetAllAlarmEventsByUserIdCmd } from '../../application/commands/get-all-alarm-events-by-user-id-cmd';
import {
  GET_ALL_ALARM_EVENTS_USE_CASE,
  GetAllAlarmEventsUseCase,
} from '../../application/ports/in/get-all-alarm-events-use-case.interface';
import { GetAllAlarmEventsResDto } from '../../infrastructure/dtos/out/get-all-alarm-events-res-dto';

@Controller('alarm-events')
export class AlarmEventsController {
  constructor(
    @Inject(GET_ALL_ALARM_EVENTS_USE_CASE)
    private readonly getAllAlarmEventsUseCase: GetAllAlarmEventsUseCase,
    @Inject(GET_ALL_ALARM_EVENTS_BY_USER_ID_USE_CASE)
    private readonly getAllAlarmEventsByUserIdUseCase: GetAllAlarmEventsByUserIdUseCase,
    @Inject(RESOLVE_ALARM_EVENT_USE_CASE)
    private readonly resolveAlarmEventUseCase: ResolveAlarmEventUseCase,
  ) {}

  @ApiOkResponse({ type: GetAllAlarmEventsByUserIdResDto, isArray: true })
  @Get('/:userId')
  async getAllAlarmEventsByUserId(
    @Param('userId') userId: number,
  ): Promise<GetAllAlarmEventsByUserIdResDto[]> {
    const alarmEvents =
      await this.getAllAlarmEventsByUserIdUseCase.getAllAlarmEventsByUserId(
        new GetAllAlarmEventsByUserIdCmd(userId),
      );
    return plainToInstance(GetAllAlarmEventsByUserIdResDto, alarmEvents);
  }

  @ApiOkResponse({ type: GetAllAlarmEventsResDto, isArray: true })
  @Get()
  async getActiveAlarms(): Promise<GetAllAlarmEventsResDto[]> {
    const alarmEvents = await this.getAllAlarmEventsUseCase.getAllAlarmEvents();
    return plainToInstance(GetAllAlarmEventsResDto, alarmEvents);
  }

  @Post('/resolve/:id')
  async resolveAlarmEvent(@Param('id') id: string): Promise<void> {
    return this.resolveAlarmEventUseCase.resolveAlarmEvent(
      new ResolveAlarmEventCmd(id),
    );
  }
}
