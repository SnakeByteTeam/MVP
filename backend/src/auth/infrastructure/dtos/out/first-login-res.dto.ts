import { ApiProperty } from '@nestjs/swagger';

export class FirstLoginResDto {
  @ApiProperty()
  accessToken!: string;
}
