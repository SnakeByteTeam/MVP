import { ApiProperty } from "@nestjs/swagger";

export class AddUserToWardResDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;
}
