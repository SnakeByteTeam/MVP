import 'reflect-metadata';
import {
  ApiDatapointDto,
  DatapointAttributesDto,
  DatapointMetaDto,
  DatapointResponseDto,
} from 'src/cache/infrastructure/http/dtos/in/api-datapoint.dto';

describe('ApiDatapointDto', () => {
  it('should instantiate with required properties', () => {
    const attributes = new DatapointAttributesDto();
    attributes.title = 'Power';
    attributes.readable = true;
    attributes.writable = true;
    attributes.value = 'On';
    attributes.timestamp = '2026-04-09T10:00:00Z';
    attributes.enum = ['On', 'Off'];
    attributes.valueType = 'boolean';

    const meta = new DatapointMetaDto();
    meta.sfType = 'SF_OnOff';
    meta.sfeType = 'SFE_Cmd_OnOff';

    const dto = new ApiDatapointDto();
    dto.id = 'dp-1';
    dto.type = 'datapoint';
    dto.attributes = attributes;
    dto.meta = meta;

    expect(dto.id).toBe('dp-1');
    expect(dto.type).toBe('datapoint');
    expect(dto.attributes.title).toBe('Power');
    expect(dto.meta.sfType).toBe('SF_OnOff');
  });

  it('should handle datapoint attributes with all properties', () => {
    const attributes = new DatapointAttributesDto();
    attributes.title = 'Brightness';
    attributes.readable = true;
    attributes.writable = true;
    attributes.value = '75';
    attributes.timestamp = '2026-04-09T11:00:00Z';
    attributes.enum = [];
    attributes.valueType = 'number';

    expect(attributes.title).toBe('Brightness');
    expect(attributes.readable).toBe(true);
    expect(attributes.writable).toBe(true);
    expect(attributes.value).toBe('75');
    expect(attributes.valueType).toBe('number');
  });

  it('should handle datapoint meta information', () => {
    const meta = new DatapointMetaDto();
    meta.sfType = 'SF_Light';
    meta.sfeType = 'SFE_Slider';

    expect(meta.sfType).toBe('SF_Light');
    expect(meta.sfeType).toBe('SFE_Slider');
  });

  it('should handle multiple datapoints in response', () => {
    const dp1 = new ApiDatapointDto();
    dp1.id = 'dp-1';
    dp1.type = 'datapoint';

    const dp2 = new ApiDatapointDto();
    dp2.id = 'dp-2';
    dp2.type = 'datapoint';

    const response = new DatapointResponseDto();
    response.data = [dp1, dp2];

    expect(response.data).toHaveLength(2);
    expect(response.data[0].id).toBe('dp-1');
    expect(response.data[1].id).toBe('dp-2');
  });

  it('should handle read-only datapoint', () => {
    const attributes = new DatapointAttributesDto();
    attributes.readable = true;
    attributes.writable = false;

    expect(attributes.readable).toBe(true);
    expect(attributes.writable).toBe(false);
  });

  it('should handle write-only datapoint', () => {
    const attributes = new DatapointAttributesDto();
    attributes.readable = false;
    attributes.writable = true;

    expect(attributes.readable).toBe(false);
    expect(attributes.writable).toBe(true);
  });

  it('should handle empty enum values', () => {
    const attributes = new DatapointAttributesDto();
    attributes.enum = [];

    expect(attributes.enum).toEqual([]);
  });

  it('should handle multiple enum values', () => {
    const attributes = new DatapointAttributesDto();
    attributes.enum = ['Cool', 'Heat', 'Dry', 'Auto'];

    expect(attributes.enum).toEqual(['Cool', 'Heat', 'Dry', 'Auto']);
    expect(attributes.enum).toHaveLength(4);
  });
});
