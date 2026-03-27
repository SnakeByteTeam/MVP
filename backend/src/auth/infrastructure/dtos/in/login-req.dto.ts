import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginReqDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4, {
    message:
      'Username is too short. Minimal length is $constraint1 characters, but actual is $value',
  })
  username!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}
