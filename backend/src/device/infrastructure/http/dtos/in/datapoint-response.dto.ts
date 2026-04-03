import { DatapointValue } from 'src/device/domain/models/device-value.model';

export interface DatapointApiResponse {
  meta: {
    collection: {
      offset: number;
      items: number;
      total: number;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      title: string;
      readable: boolean;
      writable: boolean;
      value: string;
      timestamp: string;
      enum?: string[];
      valueType: string;
    };
    meta: {
      'vimar:sfType': string;
      'vimar:sfeType': string;
    };
    relationships: Record<string, any>;
  }[];
}

export class DatapointExtractedDto {
  id: string;
  name: string;
  value: string | number;

  constructor(id: string, name: string, value: string | number) {
    this.id = id;
    this.name = name;
    this.value = value;
  }

  static fromApiResponse(
    data: DatapointApiResponse['data'][0],
  ): DatapointExtractedDto {
    return new DatapointExtractedDto(
      data.id,
      data.attributes.title,
      data.attributes.value as string | number,
    );
  }

  static fromApiResponses(
    response: DatapointApiResponse,
  ): DatapointExtractedDto[] {
    return response.data
      .filter((dp) => dp.attributes.readable === true)
      .map((dp) => DatapointExtractedDto.fromApiResponse(dp));
  }

  static toDomain(response: DatapointExtractedDto) {
    return new DatapointValue(response.id, response.name, response.value);
  }
}
