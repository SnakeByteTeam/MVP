import { ApiProperty } from '@nestjs/swagger';

export class FindAllPlantsByWardIdResDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}
