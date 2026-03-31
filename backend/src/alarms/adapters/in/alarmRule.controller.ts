import {
  Controller, Get, Post, Put, Delete,
  Param, Body,
} from '@nestjs/common';
import { AlarmService } from '../../application/services/alarm.service';
import { AlarmDto } from '../../infrastructure/dtos/alarm.dto';
import { CreateAlarmDto } from '../../infrastructure/dtos/create-alarm.dto';
import { UpdateAlarmDto } from '../../infrastructure/dtos/update-alarm.dto';
import { CreateAlarmCmd } from '../../application/commands/create-alarm.cmd';
import { UpdateAlarmCmd } from '../../application/commands/update-alarm.cmd';

@Controller('alarmRule')
export class AlarmRuleController {
  constructor(private readonly alarmService: AlarmService) {}

  // GET /alarmRule
  @Get()
  async getAllAlarms(): Promise<AlarmDto[]> {
    const alarms = await this.alarmService.getAllAlarms();
    return alarms.map(AlarmDto.fromDomain);
  }

  // GET /alarmRule/:id
  @Get(':id')
  async getAlarm(@Param('id') id: string): Promise<AlarmDto> {
    const alarm = await this.alarmService.getAlarm(id);
    return AlarmDto.fromDomain(alarm);
  }

  // POST /alarmRule
  @Post()
  async createAlarm(@Body() dto: CreateAlarmDto): Promise<AlarmDto> {
    const cmd = new CreateAlarmCmd(
      dto.name,
      dto.plantId,
      dto.deviceId,
      dto.priority,
      dto.threshold,
      dto.activationTime,
      dto.deactivationTime,
    );
    const alarm = await this.alarmService.createAlarm(cmd);
    return AlarmDto.fromDomain(alarm);
  }

  // PUT /alarmRule/:id
  @Put(':id')
  async updateAlarm(
    @Param('id') id: string,
    @Body() dto: UpdateAlarmDto,
  ): Promise<AlarmDto> {
    const cmd = new UpdateAlarmCmd(
      id,
      dto.priority,
      dto.threshold,
      dto.activationTime,
      dto.deactivationTime,
      dto.enabled,
    );
    const alarm = await this.alarmService.updateAlarm(cmd);
    return AlarmDto.fromDomain(alarm);
  }

  // DELETE /alarmRule/:id
  @Delete(':id')
  async deleteAlarm(@Param('id') id: string): Promise<void> {
    return this.alarmService.deleteAlarm(id);
  }
}