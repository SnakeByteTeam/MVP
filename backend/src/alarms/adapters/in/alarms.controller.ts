import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject,
} from '@nestjs/common';
import { AlarmDto } from '../../infrastructure/dtos/alarm.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateAlarmDto } from '../../infrastructure/dtos/create-alarm.dto';
import { UpdateAlarmDto } from '../../infrastructure/dtos/update-alarm.dto';
import { CreateAlarmCmd } from '../../application/commands/create-alarm.cmd';
import { UpdateAlarmCmd } from '../../application/commands/update-alarm.cmd';
import { DeleteAlarmCmd } from '../../application/commands/delete-alarm-cmd';
import { GetAlarmCmd } from '../../application/commands/get-alarm-cmd';
import {
  CREATE_ALARM_USE_CASE,
  CreateAlarmUseCase,
} from '../../application/ports/in/create-alarm.use-case';
import {
  DELETE_ALARM_USE_CASE,
  DeleteAlarmUseCase,
} from '../../application/ports/in/delete-alarm.use-case';
import {
  GET_ALARM_USE_CASE,
  GetAlarmUseCase,
} from '../../application/ports/in/get-alarm.use-case';
import {
  GET_ALL_ALARMS_USE_CASE,
  GetAllAlarmsUseCase,
} from '../../application/ports/in/get-all-alarms.use-case';
import {
  UPDATE_ALARM_USE_CASE,
  UpdateAlarmUseCase,
} from '../../application/ports/in/update-alarm.use-case';

@Controller('alarms')
export class AlarmsController {
  constructor(
    @Inject(CREATE_ALARM_USE_CASE)
    private readonly createAlarmUseCase: CreateAlarmUseCase,
    @Inject(DELETE_ALARM_USE_CASE)
    private readonly deleteAlarmUseCase: DeleteAlarmUseCase,
    @Inject(GET_ALARM_USE_CASE)
    private readonly getAlarmUseCase: GetAlarmUseCase,
    @Inject(GET_ALL_ALARMS_USE_CASE)
    private readonly getAllAlarmsUseCase: GetAllAlarmsUseCase,
    @Inject(UPDATE_ALARM_USE_CASE)
    private readonly updateAlarmUseCase: UpdateAlarmUseCase,
  ) {}

  @ApiOkResponse({ type: AlarmDto })
  @Post()
  async createAlarm(@Body() dto: CreateAlarmDto): Promise<AlarmDto> {
    const alarm = await this.createAlarmUseCase.createAlarm(
      new CreateAlarmCmd(
        dto.name,
        dto.plantId,
        dto.deviceId,
        dto.priority,
        dto.threshold,
        dto.activationTime,
        dto.deactivationTime,
      ),
    );
    return AlarmDto.fromDomain(alarm);
  }

  @ApiOkResponse({ type: AlarmDto, isArray: true })
  @Get()
  async getAllAlarms(): Promise<AlarmDto[]> {
    const alarms = await this.getAllAlarmsUseCase.getAllAlarms();
    return alarms.map(AlarmDto.fromDomain);
  }

  @ApiOkResponse({ type: AlarmDto })
  @Get(':id')
  async getAlarm(@Param('id') id: string): Promise<AlarmDto> {
    const alarm = await this.getAlarmUseCase.getAlarm(new GetAlarmCmd(id));
    return AlarmDto.fromDomain(alarm);
  }

  @ApiOkResponse({ type: AlarmDto })
  @Put(':id')
  async updateAlarm(
    @Param('id') id: string,
    @Body() dto: UpdateAlarmDto,
  ): Promise<AlarmDto> {
    const alarm = await this.updateAlarmUseCase.updateAlarm(
      new UpdateAlarmCmd(
        id,
        dto.priority,
        dto.threshold,
        dto.activationTime,
        dto.deactivationTime,
        dto.enabled,
      ),
    );
    return AlarmDto.fromDomain(alarm);
  }

  @ApiOkResponse({ type: AlarmDto })
  @Delete(':id')
  async deleteAlarm(@Param('id') id: string): Promise<void> {
    return this.deleteAlarmUseCase.deleteAlarm(new DeleteAlarmCmd(id));
  }
}
