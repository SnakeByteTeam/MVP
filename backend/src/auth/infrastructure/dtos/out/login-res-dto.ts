import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiProperty()
  accessToken!: string;
}
