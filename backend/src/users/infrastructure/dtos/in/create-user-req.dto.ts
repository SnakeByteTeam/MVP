import { IsString, Length, MaxLength, MinLength } from "class-validator";

export class CreateUserReqDto {
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

    @IsString()
    @MinLength(2, {
        message: 'Role is too short. Minimal length is $constraint1 characters, but actual is $value',
    })
    @MaxLength(255, {
        message: 'Role is too long. Maximal length is $constraint1 characters, but actual is $value',
    })
    role!: string;

    @IsString()
    @Length(128, 128, {
        message: 'Temporary password is too short. Minimal length is $constraint1 characters, but actual is $value',
    })
    tempPassword!: string;
}
