import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlarmRuleReqDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  deviceId!: string;

  @ApiProperty({ enum: AlarmPriority })
  priority!: AlarmPriority;

  @ApiProperty({ enum: ['>', '<', '>=', '<='] })
  @IsString()
  @MinLength(1)
  @MaxLength(2)
  @IsIn(['>', '<', '>=', '<='])
  thresholdOperator!: string;

  @ApiProperty()
  @IsString()
  thresholdValue!: string;

  @ApiProperty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'deactivationTime must be in HH:MM format (00:00 - 23:59)',
  })
  activationTime!: string;

  @ApiProperty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'deactivationTime must be in HH:MM format (00:00 - 23:59)',
  })
  deactivationTime!: string;
}
