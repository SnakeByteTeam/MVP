import { IsNotEmpty, IsString } from "class-validator";

export class RefreshReqDto {
    @IsString()
    @IsNotEmpty()
    refreshToken!: string;
}
