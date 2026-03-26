import { ApiProperty } from '@nestjs/swagger';

export class FindAllUsersByWardIdResDto {
  @ApiProperty()
  id!: number;
}
