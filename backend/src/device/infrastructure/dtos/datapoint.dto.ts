import { IsArray, IsBoolean, IsNotEmpty, IsString } from "class-validator"

export class DatapointDto{

    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    @IsNotEmpty()
    readable: boolean;

    @IsBoolean()
    @IsNotEmpty()
    writable: boolean;

    @IsString()
    @IsNotEmpty()
    valueType: string;

    @IsArray()
    @IsNotEmpty()
    enum: string[];

    @IsString()
    @IsNotEmpty()
    sfeType: string;
}