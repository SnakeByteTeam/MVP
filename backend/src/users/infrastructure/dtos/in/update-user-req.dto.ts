import { IsString, MinLength, MaxLength } from "class-validator";

export class UpdateUserReqDto {
    @IsString()
    @MinLength(4, {
        message: 'Username is too short. Minimal length is $constraint1 characters, but actual is $value',
    })
    username!: string;
    
    @IsString()
    @MinLength(2, {
        message: 'Surname is too short. Minimal length is $constraint1 characters, but actual is $value',
    })
    @MaxLength(255, {
        message: 'Surname is too long. Maximal length is $constraint1 characters, but actual is $value',
    })
    surname!: string;

    @IsString()
    @MinLength(2, {
        message: 'Name is too short. Minimal length is $constraint1 characters, but actual is $value',
    })
    @MaxLength(255, {
        message: 'Name is too long. Maximal length is $constraint1 characters, but actual is $value',
    })
    name!: string;
}
