import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class GetSuggestionDto {
  @IsString()
  @IsNotEmpty()
  readonly metric: string;

  @IsArray()
  @IsString({ each: true })
  readonly labels: string[];

  @IsArray()
  @IsString({ each: true })
  readonly data: string[];
}
