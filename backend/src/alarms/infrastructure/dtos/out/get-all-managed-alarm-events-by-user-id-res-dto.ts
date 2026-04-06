import { ApiProperty } from '@nestjs/swagger';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class GetAllManagedAlarmEventsByUserIdResDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  position!: string;

  @ApiProperty()
  alarmRuleId!: string;

  @ApiProperty()
  deviceId!: string;

  @ApiProperty()
  alarmName!: string;

  @ApiProperty()
  priority!: AlarmPriority;

  @ApiProperty()
  activationTime!: Date;

  @ApiProperty()
  resolutionTime!: Date | null;

  @ApiProperty()
  userUsername!: string | null;
}
