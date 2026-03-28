import { ApiProperty } from "@nestjs/swagger";

export class AddPlantToWardResDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;
}
