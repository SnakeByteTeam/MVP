import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { DatapointDto } from './datapoint.dto';

describe('DatapointDto', () => {
  it('should map dto to domain when enum is an array', () => {
    const dto = new DatapointDto();
    dto.id = 'dp-1';
    dto.name = 'Power';
    dto.readable = true;
    dto.writable = false;
    dto.valueType = 'string';
    dto.enum = ['Off', 'On'];
    dto.sfeType = 'SFE_Cmd_OnOff';

    const datapoint = DatapointDto.toDomain(dto);

    expect(datapoint.getId()).toBe('dp-1');
    expect(datapoint.getEnum()).toEqual(['Off', 'On']);
  });

  it('should map dto to domain with empty enum when enum is not an array', () => {
    const dto = new DatapointDto();
    dto.id = 'dp-2';
    dto.name = 'Brightness';
    dto.readable = true;
    dto.writable = true;
    dto.valueType = 'number';
    (dto as any).enum = undefined;
    dto.sfeType = 'SFE_Cmd_Dimmer';

    const datapoint = DatapointDto.toDomain(dto);

    expect(datapoint.getId()).toBe('dp-2');
    expect(datapoint.getEnum()).toEqual([]);
  });

  it('should map domain to dto', () => {
    const datapoint = new Datapoint(
      'dp-3',
      'Mode',
      true,
      true,
      'string',
      ['Auto', 'Manual'],
      'SFE_Mode',
    );

    const dto = DatapointDto.fromDomain(datapoint);

    expect(dto.id).toBe('dp-3');
    expect(dto.name).toBe('Mode');
    expect(dto.readable).toBe(true);
    expect(dto.writable).toBe(true);
    expect(dto.valueType).toBe('string');
    expect(dto.enum).toEqual(['Auto', 'Manual']);
    expect(dto.sfeType).toBe('SFE_Mode');
  });
});
