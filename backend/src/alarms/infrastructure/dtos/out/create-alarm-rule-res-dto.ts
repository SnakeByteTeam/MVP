import { ApiProperty } from '@nestjs/swagger';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class CreateAlarmRuleResDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  deviceId!: string;

  @ApiProperty()
  priority!: AlarmPriority;

  @ApiProperty()
  thresholdOperator!: string;

  @ApiProperty()
  thresholdValue!: string;

  @ApiProperty()
  armingTime!: string;

  @ApiProperty()
  dearmingTime!: string;
}
