import { ApiProperty } from '@nestjs/swagger';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class GetAllAlarmEventsByUserIdResDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  alarmRuleId!: string;

  @ApiProperty()
  alarmName!: string;

  @ApiProperty()
  priority!: AlarmPriority;

  @ApiProperty()
  activationTime!: Date;

  @ApiProperty()
  resolutionTime!: Date | null;
}
