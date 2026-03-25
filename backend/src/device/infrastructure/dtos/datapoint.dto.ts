import { IsArray, IsBoolean, IsNotEmpty, IsString } from "class-validator"
import { Datapoint } from "src/device/domain/models/datapoint.model";

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

    static toDomain(dto: DatapointDto): Datapoint {
        const enumValues = Array.isArray(dto.enum) ? dto.enum : [];
        return new Datapoint(
            dto.id,
            dto.name,
            dto.readable,
            dto.writable,
            dto.valueType,
            enumValues,
            dto.sfeType,
        );
    }

    static fromDomain(datapoint: Datapoint): DatapointDto {
        const dto = new DatapointDto();
        dto.id = datapoint.getId();
        dto.name = datapoint.getName();
        dto.readable = datapoint.isReadable();
        dto.writable = datapoint.isWritable();
        dto.valueType = datapoint.getValueType();
        dto.enum = datapoint.getEnum();
        dto.sfeType = datapoint.getSfeType();
        return dto;
    }
}