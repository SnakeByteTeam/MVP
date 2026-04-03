import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddUserToWardReqDto {
  @ApiProperty()
  @IsNumber()
  userId!: number;

  @ApiProperty()
  @IsNumber()
  wardId!: number;
}
