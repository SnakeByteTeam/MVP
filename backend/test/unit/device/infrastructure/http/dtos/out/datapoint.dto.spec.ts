import { DatapointDto } from 'src/device/infrastructure/http/dtos/out/datapoint.dto';
import { Datapoint } from 'src/device/domain/models/datapoint.model';

describe('DatapointDto', () => {
  describe('toDomain', () => {
    it('should convert DatapointDto to Datapoint domain model', () => {
      const dto = new DatapointDto();
      dto.id = 'dp-1';
      dto.name = 'Power';
      dto.readable = true;
      dto.writable = true;
      dto.valueType = 'boolean';
      dto.enum = ['On', 'Off'];
      dto.sfeType = 'SFE_Cmd_OnOff';

      const datapoint = DatapointDto.toDomain(dto);

      expect(datapoint).toBeInstanceOf(Datapoint);
      expect(datapoint.getId()).toBe('dp-1');
      expect(datapoint.getName()).toBe('Power');
      expect(datapoint.isReadable()).toBe(true);
      expect(datapoint.isWritable()).toBe(true);
      expect(datapoint.getValueType()).toBe('boolean');
      expect(datapoint.getEnum()).toEqual(['On', 'Off']);
      expect(datapoint.getSfeType()).toBe('SFE_Cmd_OnOff');
    });

    it('should handle empty enum array', () => {
      const dto = new DatapointDto();
      dto.id = 'dp-2';
      dto.name = 'Temperature';
      dto.readable = true;
      dto.writable = false;
      dto.valueType = 'number';
      dto.enum = [];
      dto.sfeType = 'SFE_Temperature';

      const datapoint = DatapointDto.toDomain(dto);

      expect(datapoint.getEnum()).toEqual([]);
    });

    it('should handle null enum as empty array', () => {
      const dto = new DatapointDto();
      dto.id = 'dp-3';
      dto.name = 'Brightness';
      dto.readable = true;
      dto.writable = true;
      dto.valueType = 'number';
      dto.enum = null as any;
      dto.sfeType = 'SFE_Dimmer';

      const datapoint = DatapointDto.toDomain(dto);

      expect(datapoint.getEnum()).toEqual([]);
    });

    it('should convert datapoint with multiple enum values', () => {
      const dto = new DatapointDto();
      dto.id = 'dp-4';
      dto.name = 'Mode';
      dto.readable = true;
      dto.writable = true;
      dto.valueType = 'string';
      dto.enum = ['Cool', 'Heat', 'Dry', 'Auto'];
      dto.sfeType = 'SFE_Mode';

      const datapoint = DatapointDto.toDomain(dto);

      expect(datapoint.getEnum()).toContain('Cool');
      expect(datapoint.getEnum()).toHaveLength(4);
    });

    it('should handle read-only datapoint', () => {
      const dto = new DatapointDto();
      dto.id = 'dp-5';
      dto.name = 'Status';
      dto.readable = true;
      dto.writable = false;
      dto.valueType = 'string';
      dto.enum = [];
      dto.sfeType = 'SFE_Status';

      const datapoint = DatapointDto.toDomain(dto);

      expect(datapoint.isReadable()).toBe(true);
      expect(datapoint.isWritable()).toBe(false);
    });

    it('should handle write-only datapoint', () => {
      const dto = new DatapointDto();
      dto.id = 'dp-6';
      dto.name = 'Command';
      dto.readable = false;
      dto.writable = true;
      dto.valueType = 'string';
      dto.enum = [];
      dto.sfeType = 'SFE_Command';

      const datapoint = DatapointDto.toDomain(dto);

      expect(datapoint.isReadable()).toBe(false);
      expect(datapoint.isWritable()).toBe(true);
    });
  });
});
