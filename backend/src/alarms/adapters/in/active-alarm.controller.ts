import {
  Controller, Get, Post, Param,
} from '@nestjs/common';
import { AlarmService } from '../../application/services/alarm.service';
import { ActiveAlarmDto } from '../../infrastructure/dtos/active-alarm.dto';
 
@Controller('active-alarms')
export class ActiveAlarmController {
  constructor(private readonly alarmService: AlarmService) {}
 
  // GET /active-alarms
  @Get()
  async getActiveAlarms(): Promise<ActiveAlarmDto[]> {
    const alarms = await this.alarmService.getActiveAlarms();
    return alarms.map(ActiveAlarmDto.fromDomain);
  }
 
  // POST /active-alarms/:id/resolve
  @Post(':id/resolve')
  async resolveActiveAlarm(@Param('id') id: string): Promise<void> {
    return this.alarmService.resolveActiveAlarm(id);
  }
}
 