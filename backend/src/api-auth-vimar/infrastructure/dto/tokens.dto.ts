import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({ example: 'def50200b95f...' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({ example: 3600 })
  @IsNumber()
  @IsNotEmpty()
  expiresIn: number;

  @ApiProperty({ example: 'ciao@ciao.it'})
  @IsString()
  @IsNotEmpty()
  email: string;
}
