import {
  Controller,
  Get,
  Param,
  Inject,
  Body,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
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
import { ResolveAlarmEventReqDto } from '../../infrastructure/dtos/in/resolve-alarm-event-req-dto';
import { GetAllAlarmEventsCmd } from '../../application/commands/get-all-alarm-events-cmd';
import { UserGuard } from '../../../guard/user/user.guard';
import { AdminGuard } from '../../../guard/admin/admin.guard';

@Controller('alarm-events')
export class AlarmEventsController {
  constructor(
    @Inject(GET_ALL_ALARM_EVENTS_USE_CASE)
    private readonly getAllAlarmEventsUseCase: GetAllAlarmEventsUseCase,
    @Inject(GET_ALL_ALARM_EVENTS_BY_USER_ID_USE_CASE)
    private readonly getAllAlarmEventsByUserIdUseCase: GetAllAlarmEventsByUserIdUseCase,
    @Inject(RESOLVE_ALARM_EVENT_USE_CASE)
    private readonly resolveAlarmEventUseCase: ResolveAlarmEventUseCase,
  ) { }

  @ApiOkResponse({ type: GetAllAlarmEventsByUserIdResDto, isArray: true })
  //@UseGuards(UserGuard)
  @Get('/:userId/:limit/:offset')
  async getAllAlarmEventsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('limit', ParseIntPipe) limit: number,
    @Param('offset', ParseIntPipe) offset: number,
  ): Promise<GetAllAlarmEventsByUserIdResDto[]> {
    const alarmEvents =
      await this.getAllAlarmEventsByUserIdUseCase.getAllAlarmEventsByUserId(
        new GetAllAlarmEventsByUserIdCmd(userId, limit, offset),
      );
    return plainToInstance(GetAllAlarmEventsByUserIdResDto, alarmEvents);
  }

  @ApiOkResponse({ type: GetAllAlarmEventsResDto, isArray: true })
  //@UseGuards(UserGuard, AdminGuard)
  @Get('/:limit/:offset')
  async getAllAlarmEvents(
    @Param('limit', ParseIntPipe) limit: number,
    @Param('offset', ParseIntPipe) offset: number,
  ): Promise<GetAllAlarmEventsResDto[]> {
    const alarmEvents = await this.getAllAlarmEventsUseCase.getAllAlarmEvents(
      new GetAllAlarmEventsCmd(limit, offset),
    );
    return plainToInstance(GetAllAlarmEventsResDto, alarmEvents);
  }

  @Patch('/resolve')
  //@UseGuards(UserGuard, AdminGuard)
  async resolveAlarmEvent(@Body() req: ResolveAlarmEventReqDto): Promise<void> {
    return this.resolveAlarmEventUseCase.resolveAlarmEvent(
      new ResolveAlarmEventCmd(req.alarmId, req.userId),
    );
  }
}
