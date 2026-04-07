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
import { GetAllManagedAlarmEventsByUserIdResDto } from '../../infrastructure/dtos/out/get-all-managed-alarm-events-by-user-id-res-dto';
import {
  GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE,
  GetAllManagedAlarmEventsByUserIdUseCase,
} from '../../application/ports/in/get-all-managed-alarm-events-by-user-id-use-case.interface';
import { GetAllManagedAlarmEventsByUserIdCmd } from '../../application/commands/get-all-managed-alarm-events-by-user-id-cmd';
import {
  GET_ALL_ALARM_EVENTS_USE_CASE,
  GetAllAlarmEventsUseCase,
} from '../../application/ports/in/get-all-alarm-events-use-case.interface';
import { GetAllAlarmEventsResDto } from '../../infrastructure/dtos/out/get-all-alarm-events-res-dto';
import { ResolveAlarmEventReqDto } from '../../infrastructure/dtos/in/resolve-alarm-event-req-dto';
import { GetAllAlarmEventsCmd } from '../../application/commands/get-all-alarm-events-cmd';
import { UserGuard } from '../../../guard/user/user.guard';
import { AdminGuard } from '../../../guard/admin/admin.guard';
import { GetAllUnmanagedAlarmEventsByUserIdResDto } from '../../infrastructure/dtos/out/get-all-unmanaged-alarm-events-by-user-id-res-dto';
import { GetAllUnmanagedAlarmEventsByUserIdCmd } from '../../application/commands/get-all-unmanaged-alarm-events-by-user-id-cmd';
import {
  GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE,
  GetAllUnmanagedAlarmEventsByUserIdUseCase,
} from '../../application/ports/in/get-all-unmanaged-alarm-events-by-user-id-use-case.interface';
import { GET_ALARM_EVENT_BY_ID_USE_CASE, GetAlarmEventByIdUseCase } from '../../application/ports/in/get-alarm-event-by-id-use-case.interface';
import { GetAlarmEventByIdCmd } from '../../application/commands/get-alarm-event-by-id-cmd';
import { GetAlarmEventByIdResDto } from '../../infrastructure/dtos/out/get-alarm-event-by-id-res-dto';

@Controller('alarm-events')
export class AlarmEventsController {
  constructor(
    @Inject(GET_ALL_ALARM_EVENTS_USE_CASE)
    private readonly getAllAlarmEventsUseCase: GetAllAlarmEventsUseCase,
    @Inject(GET_ALARM_EVENT_BY_ID_USE_CASE)
    private readonly getAlarmEventByIdUseCase: GetAlarmEventByIdUseCase
    @Inject(GET_ALL_MANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE)
    private readonly getAllManagedAlarmEventsByUserIdUseCase: GetAllManagedAlarmEventsByUserIdUseCase,
    @Inject(GET_ALL_UNMANAGED_ALARM_EVENTS_BY_USER_ID_USE_CASE)
    private readonly getAllUnmanagedAlarmEventsByUserIdUseCase: GetAllUnmanagedAlarmEventsByUserIdUseCase,
    @Inject(RESOLVE_ALARM_EVENT_USE_CASE)
    private readonly resolveAlarmEventUseCase: ResolveAlarmEventUseCase,
  ) {}

  @ApiOkResponse({ type: GetAlarmEventByIdResDto })
  //@UseGuards(UserGuard, AdminGuard)
  @Get('/:id')
  async getAlarmEventById(
     @Param('id') id: string,
  ): Promise<GetAlarmEventByIdResDto> {
    const alarmEvent = await this.getAlarmEventByIdUseCase.getAlarmEventById(
      new GetAlarmEventByIdCmd(id)
    );
    return plainToInstance(GetAlarmEventByIdResDto, alarmEvent);
  }

  @ApiOkResponse({
    type: GetAllManagedAlarmEventsByUserIdResDto,
    isArray: true,
  })
  //@UseGuards(UserGuard)
  @Get('managed/:userId/:limit/:offset')
  async getAllManagedAlarmEventsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('limit', ParseIntPipe) limit: number,
    @Param('offset', ParseIntPipe) offset: number,
  ): Promise<GetAllManagedAlarmEventsByUserIdResDto[]> {
    const managedAlarmEvents =
      await this.getAllManagedAlarmEventsByUserIdUseCase.getAllManagedAlarmEventsByUserId(
        new GetAllManagedAlarmEventsByUserIdCmd(userId, limit, offset),
      );
    return plainToInstance(
      GetAllManagedAlarmEventsByUserIdResDto,
      managedAlarmEvents,
    );
  }

  @ApiOkResponse({
    type: GetAllUnmanagedAlarmEventsByUserIdResDto,
    isArray: true,
  })
  //@UseGuards(UserGuard)
  @Get('unmanaged/:userId/:limit/:offset')
  async getAllUnmanagedAlarmEventsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('limit', ParseIntPipe) limit: number,
    @Param('offset', ParseIntPipe) offset: number,
  ): Promise<GetAllUnmanagedAlarmEventsByUserIdResDto[]> {
    const unmanagedAlarmEvents =
      await this.getAllUnmanagedAlarmEventsByUserIdUseCase.getAllUnmanagedAlarmEventsByUserId(
        new GetAllUnmanagedAlarmEventsByUserIdCmd(userId, limit, offset),
      );
    return plainToInstance(
      GetAllUnmanagedAlarmEventsByUserIdResDto,
      unmanagedAlarmEvents,
    );
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
  //@UseGuards(UserGuard)
  async resolveAlarmEvent(@Body() req: ResolveAlarmEventReqDto): Promise<void> {
    return this.resolveAlarmEventUseCase.resolveAlarmEvent(
      new ResolveAlarmEventCmd(req.alarmId, req.userId),
    );
  }
}
