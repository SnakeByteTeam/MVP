import { ApiProperty } from '@nestjs/swagger';

export class MyVimarAccountStatusDto {
  @ApiProperty({
    description: 'Whether a shared MyVimar account is currently linked.',
    example: true,
  })
  isLinked!: boolean;

  @ApiProperty({
    description: 'Linked MyVimar account email when available.',
    example: '',
  })
  email!: string;
}

export class MyVimarDisconnectResDto {
  @ApiProperty({
    description: 'True when disconnect operation completed successfully.',
    example: true,
  })
  success!: boolean;
}
