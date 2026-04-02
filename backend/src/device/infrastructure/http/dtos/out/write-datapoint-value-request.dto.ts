import { Expose, Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';

/**
 * DTO for datapoint value attributes in write request
 */
export class DatapointValueAttributesDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  value: string;
}

/**
 * DTO for a single datapoint in write request
 */
export class DatapointValueDataDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  type: string = 'datapoint';

  @Expose()
  @Type(() => DatapointValueAttributesDto)
  @ValidateNested()
  @IsNotEmpty()
  attributes: DatapointValueAttributesDto;
}

/**
 * DTO for write datapoint value request to Vimar API
 *
 * @example
 * {
 *   "data": [
 *     {
 *       "id": "dp-012910FAB04407-1090560304-SFE_Cmd_OnOff",
 *       "type": "datapoint",
 *       "attributes": {
 *         "value": "On"
 *       }
 *     }
 *   ]
 * }
 */
export class WriteDatapointValueRequestDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DatapointValueDataDto)
  @IsNotEmpty()
  data: DatapointValueDataDto[];

  /**
   * Factory method to create request DTO from datapoint ID and value
   */
  static fromDatapoint(datapointId: string, value: string): WriteDatapointValueRequestDto {
    const dto = new WriteDatapointValueRequestDto();
    dto.data = [
      {
        id: datapointId,
        type: 'datapoint',
        attributes: {
          value: value,
        },
      },
    ];
    return dto;
  }
}
