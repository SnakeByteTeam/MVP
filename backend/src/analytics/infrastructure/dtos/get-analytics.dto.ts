import { IsString, IsNotEmpty } from 'class-validator';

export class GetAnalyticsDto {
  @IsString()
  @IsNotEmpty()
  readonly plantId: string;
}
