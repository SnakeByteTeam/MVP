import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class AddPlantToWardReqDto {
  @ApiProperty()
  @IsString()
  plantId!: string;

  @ApiProperty()
  @IsNumber()
  wardId!: number;
}
