import {
  IsBoolean,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAlarmRuleReqDto {
  @ApiProperty({ enum: AlarmPriority })
  priority!: AlarmPriority;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2)
  @IsIn(['>', '<', '>=', '<=', '='])
  thresholdOperator!: string;

  @ApiProperty()
  @IsString()
  thresholdValue!: string;

  @ApiProperty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'armingTime must be in HH:MM format (00:00 - 23:59)',
  })
  armingTime!: string;

  @ApiProperty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'dearmingTime must be in HH:MM format (00:00 - 23:59)',
  })
  dearmingTime!: string;

  @ApiProperty()
  @IsBoolean()
  isArmed!: boolean;
}
