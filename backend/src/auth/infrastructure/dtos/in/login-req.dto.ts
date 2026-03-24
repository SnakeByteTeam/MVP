import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginReqDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(4, {
        message: 'Username is too short. Minimal length is $constraint1 characters, but actual is $value',
    })
    username!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}
