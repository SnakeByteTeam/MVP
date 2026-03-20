import { IsString, IsNotEmpty } from 'class-validator';

export class GetAnalyticsDto {
  @IsString()
  @IsNotEmpty()
  readonly metric: string;

  @IsString()
  @IsNotEmpty()
  readonly id: string;
}
