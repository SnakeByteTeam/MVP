import { ApiProperty } from '@nestjs/swagger';

export class RefreshResDto {
  @ApiProperty()
  accessToken!: string;
}
