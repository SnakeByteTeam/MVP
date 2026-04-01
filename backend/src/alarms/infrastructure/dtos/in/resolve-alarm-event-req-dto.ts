import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ResolveAlarmEventReqDto {
  @ApiProperty()
  @IsNumber()
  userId!: number;

  @IsString()
  @ApiProperty()
  alarmId!: string;
}
