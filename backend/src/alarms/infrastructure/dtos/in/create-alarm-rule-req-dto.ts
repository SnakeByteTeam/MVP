import {
  IsIn,
  IsNumberString,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlarmRuleReqDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  deviceId!: string;

  @ApiProperty()
  @IsString()
  plantId!: string;

  @ApiProperty({ enum: AlarmPriority })
  priority!: AlarmPriority;

  @ApiProperty({ enum: ['>', '<', '>=', '<=', '='] })
  @IsString()
  @MinLength(1)
  @MaxLength(2)
  @IsIn(['>', '<', '>=', '<=', '='])
  thresholdOperator!: string;

  @ApiProperty()
  @IsString()
  @ApiProperty({ example: '10 | on | off' })
  @ValidateIf((o) => o.thresholdValue !== 'on' && o.thresholdValue !== 'off')
  @IsNumberString()
  @ValidateIf((o) => o.thresholdValue === 'on' || o.thresholdValue === 'off')
  @IsIn(['on', 'off'])
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
}
