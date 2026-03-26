import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddPlantToWardReqDto {
  @ApiProperty()
  @IsNumber()
  plantId!: number;

  @ApiProperty()
  @IsNumber()
  wardId!: number;
}
