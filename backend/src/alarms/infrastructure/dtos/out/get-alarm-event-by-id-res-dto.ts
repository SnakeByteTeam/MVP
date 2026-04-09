import { ApiProperty } from '@nestjs/swagger';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class GetAlarmEventByIdResDto {
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

  @ApiProperty()
  resolutionTime!: Date | null;

  @ApiProperty()
  userId!: number | null;

  @ApiProperty()
  userUsername!: string | null;
}
