import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserResDto {
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
