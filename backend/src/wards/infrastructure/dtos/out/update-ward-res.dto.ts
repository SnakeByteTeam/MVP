import { ApiProperty } from '@nestjs/swagger/dist/decorators';

export class UpdateWardResDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}
