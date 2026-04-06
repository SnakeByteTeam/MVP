import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResDto {
  @ApiProperty()
  id!: number

  @ApiProperty()
  username!: number;

  @ApiProperty()
  surname!: string;

  @ApiProperty()
  role!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  tempPassword!: string;
}
