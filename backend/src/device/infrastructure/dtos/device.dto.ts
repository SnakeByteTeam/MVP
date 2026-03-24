import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { DatapointDto } from "./datapoint.dto";

export class DeviceDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    plantId: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    subType: string;

    @IsArray()
    @IsNotEmpty()
    datapoints: DatapointDto[];
}