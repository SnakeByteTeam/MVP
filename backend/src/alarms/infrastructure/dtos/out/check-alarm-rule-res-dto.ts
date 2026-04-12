import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckAlarmRuleResDto {
  @ApiProperty()
  alarmRuleId!: string;

  @ApiProperty({ example: 1, type: Number })
  wardId!: number;

  @ApiPropertyOptional({ example: 'a2c89b49-904a-4f15-9015-4f872f84f4df' })
  alarmEventId?: string;
}
