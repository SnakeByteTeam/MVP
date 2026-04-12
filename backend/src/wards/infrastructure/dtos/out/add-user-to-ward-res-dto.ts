import { ApiProperty } from '@nestjs/swagger';

export class AddUserToWardResDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  username!: string;
}
