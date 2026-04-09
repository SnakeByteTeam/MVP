import { ApiProperty } from '@nestjs/swagger';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class GetAllAlarmRulesResDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  position!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  thresholdOperator!: string;

  @ApiProperty()
  thresholdValue!: string;

  @ApiProperty()
  priority!: AlarmPriority;

  @ApiProperty()
  armingTime!: Date;

  @ApiProperty()
  dearmingTime!: Date;

  @ApiProperty()
  isArmed!: boolean;
}
