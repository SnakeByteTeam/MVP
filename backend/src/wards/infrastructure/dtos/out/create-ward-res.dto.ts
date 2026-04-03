import { ApiProperty } from '@nestjs/swagger';

export class CreateWardResDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}
