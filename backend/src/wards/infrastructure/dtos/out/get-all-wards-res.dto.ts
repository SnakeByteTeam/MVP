import { ApiProperty } from '@nestjs/swagger';

export class GetAllWardsResDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}
