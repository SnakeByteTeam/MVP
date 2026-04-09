import { ApiProperty } from '@nestjs/swagger';

export class FindAllWardsResDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}
