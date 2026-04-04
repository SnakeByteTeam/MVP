import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { AlarmPriority } from '../../../domain/models/alarm-priority.enum';

export class CreateAlarmRuleReqDto {
  @IsString()
  name!: string;

  @IsString()
  deviceId!: string;

  priority!: AlarmPriority;

  @IsString()
  @MinLength(1)
  @MaxLength(1)
  thresholdOperator!: string;

  @IsString()
  thresholdValue!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'deactivationTime must be in HH:MM format (00:00 - 23:59)',
  })
  activationTime!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'deactivationTime must be in HH:MM format (00:00 - 23:59)',
  })
  deactivationTime!: string;
}
