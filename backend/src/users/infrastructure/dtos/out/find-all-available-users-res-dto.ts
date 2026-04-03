import { ApiProperty } from '@nestjs/swagger';

export class FindAllAvailableUsersResDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  surname!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  role!: string;
}
