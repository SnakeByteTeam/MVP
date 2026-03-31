import { Controller, Get, Post, Param, Inject } from '@nestjs/common';
import { ActiveAlarmDto } from '../../infrastructure/dtos/active-alarm.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ResolveActiveAlarmCmd } from '../../application/commands/resolve-active-alarm-cmd';
import {
  GET_ACTIVE_ALARMS_USE_CASE,
  GetActiveAlarmsUseCase,
} from '../../application/ports/in/get-active-alarms.use-case';
import {
  RESOLVE_ACTIVE_ALARM_USE_CASE,
  ResolveActiveAlarmUseCase,
} from '../../application/ports/in/resolve-active-alarm.use-case';

@Controller('active-alarms')
export class ActiveAlarmsController {
  constructor(
    @Inject(GET_ACTIVE_ALARMS_USE_CASE)
    private readonly getActiveAlarmsUseCase: GetActiveAlarmsUseCase,
    @Inject(RESOLVE_ACTIVE_ALARM_USE_CASE)
    private readonly resolveActiveAlarmUseCase: ResolveActiveAlarmUseCase,
  ) {}

  @ApiOkResponse({ type: ActiveAlarmDto, isArray: true })
  @Get()
  async getActiveAlarms(): Promise<ActiveAlarmDto[]> {
    const alarms = await this.getActiveAlarmsUseCase.getActiveAlarms();
    // return alarms.map(ActiveAlarmDto.fromDomain);
    return plainToInstance(ActiveAlarmDto, alarms);
  }

  @Post('/resolve/:id')
  async resolveActiveAlarm(@Param('id') id: string): Promise<void> {
    return this.resolveActiveAlarmUseCase.resolveActiveAlarm(
      new ResolveActiveAlarmCmd(id),
    );
  }
}
