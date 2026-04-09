import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GetAnalyticsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly plantId: string;
}
