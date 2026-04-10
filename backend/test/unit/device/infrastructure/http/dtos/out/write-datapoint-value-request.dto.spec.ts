import 'reflect-metadata';
import {
  DatapointValueAttributesDto,
  DatapointValueDataDto,
  WriteDatapointValueRequestDto,
} from 'src/device/infrastructure/http/dtos/out/write-datapoint-value-request.dto';

describe('WriteDatapointValueRequestDto', () => {
  it('should build request payload from datapoint id and value', () => {
    const dto = WriteDatapointValueRequestDto.fromDatapoint('dp-1', 'On');

    expect(dto.data).toEqual([
      {
        id: 'dp-1',
        type: 'datapoint',
        attributes: {
          value: 'On',
        },
      },
    ]);
  });

  it('should default datapoint type to datapoint', () => {
    const data = new DatapointValueDataDto();

    expect(data.type).toBe('datapoint');
  });

  it('should allow manual nested dto composition', () => {
    const attributes = new DatapointValueAttributesDto();
    attributes.value = 'Off';

    const data = new DatapointValueDataDto();
    data.id = 'dp-2';
    data.attributes = attributes;

    const dto = new WriteDatapointValueRequestDto();
    dto.data = [data];

    expect(dto.data[0].id).toBe('dp-2');
    expect(dto.data[0].attributes.value).toBe('Off');
  });
});
