import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CheckAlarm } from '../../../domain/models/check-alarm';

export class CheckAlarmRuleResDto {
  @ApiProperty()
  alarmRuleId!: string;

  @ApiProperty({ example: 1, type: Number })
  wardId!: number;

  @ApiPropertyOptional({ example: 'a2c89b49-904a-4f15-9015-4f872f84f4df' })
  alarmEventId?: string;

  static fromDomain(checkAlarm: CheckAlarm): CheckAlarmRuleResDto {
    const dto = new CheckAlarmRuleResDto();
    dto.alarmRuleId = checkAlarm.alarm_rule_id;
    dto.wardId = checkAlarm.ward_id;
    dto.alarmEventId = checkAlarm.alarm_event_id;
    return dto;
  }

  static toDomain(dto: CheckAlarmRuleResDto): CheckAlarm {
    return new CheckAlarm(dto.alarmRuleId, dto.wardId, dto.alarmEventId);
  }
}
