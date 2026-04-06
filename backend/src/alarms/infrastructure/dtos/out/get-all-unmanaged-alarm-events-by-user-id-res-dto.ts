import { ApiProperty } from '@nestjs/swagger';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class GetAllUnmanagedAlarmEventsByUserIdResDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  position!: string;

  @ApiProperty()
  alarmRuleId!: string;

  @ApiProperty()
  alarmName!: string;

  @ApiProperty()
  priority!: AlarmPriority;

  @ApiProperty()
  activationTime!: Date;
}
