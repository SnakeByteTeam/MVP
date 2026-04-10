import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { DatapointEntity } from './datapoint.entity';

describe('DatapointEntity', () => {
  describe('toDomain', () => {
    it('should convert DatapointEntity to Datapoint domain model', () => {
      const entity = new DatapointEntity();
      entity.id = 'dp-1';
      entity.name = 'Power';
      entity.readable = true;
      entity.writable = true;
      entity.valueType = 'boolean';
      entity.enum = ['On', 'Off'];
      entity.sfeType = 'SFE_Cmd_OnOff';

      const datapoint = DatapointEntity.toDomain(entity);

      expect(datapoint).toBeInstanceOf(Datapoint);
      expect(datapoint.getId()).toBe('dp-1');
      expect(datapoint.getName()).toBe('Power');
      expect(datapoint.isReadable()).toBe(true);
      expect(datapoint.isWritable()).toBe(true);
      expect(datapoint.getValueType()).toBe('boolean');
      expect(datapoint.getEnum()).toEqual(['On', 'Off']);
      expect(datapoint.getSfeType()).toBe('SFE_Cmd_OnOff');
    });

    it('should handle datapoint with empty enum', () => {
      const entity = new DatapointEntity();
      entity.id = 'dp-2';
      entity.name = 'Temperature';
      entity.readable = true;
      entity.writable = false;
      entity.valueType = 'number';
      entity.enum = [];
      entity.sfeType = 'SFE_Temperature';

      const datapoint = DatapointEntity.toDomain(entity);

      expect(datapoint.getEnum()).toEqual([]);
    });

    it('should handle datapoint with null enum as empty array', () => {
      const entity = new DatapointEntity();
      entity.id = 'dp-3';
      entity.name = 'Humidity';
      entity.readable = true;
      entity.writable = false;
      entity.valueType = 'number';
      entity.enum = null as any;
      entity.sfeType = 'SFE_Humidity';

      const datapoint = DatapointEntity.toDomain(entity);

      expect(datapoint.getEnum()).toEqual([]);
    });

    it('should handle read-only datapoint', () => {
      const entity = new DatapointEntity();
      entity.id = 'dp-4';
      entity.name = 'Status';
      entity.readable = true;
      entity.writable = false;
      entity.valueType = 'string';
      entity.enum = [];
      entity.sfeType = 'SFE_Status';

      const datapoint = DatapointEntity.toDomain(entity);

      expect(datapoint.isReadable()).toBe(true);
      expect(datapoint.isWritable()).toBe(false);
    });

    it('should handle write-only datapoint', () => {
      const entity = new DatapointEntity();
      entity.id = 'dp-5';
      entity.name = 'Command';
      entity.readable = false;
      entity.writable = true;
      entity.valueType = 'string';
      entity.enum = [];
      entity.sfeType = 'SFE_Command';

      const datapoint = DatapointEntity.toDomain(entity);

      expect(datapoint.isReadable()).toBe(false);
      expect(datapoint.isWritable()).toBe(true);
    });

    it('should handle datapoint with multiple enum values', () => {
      const entity = new DatapointEntity();
      entity.id = 'dp-6';
      entity.name = 'Mode';
      entity.readable = true;
      entity.writable = true;
      entity.valueType = 'string';
      entity.enum = ['Cool', 'Heat', 'Dry', 'Auto'];
      entity.sfeType = 'SFE_Mode';

      const datapoint = DatapointEntity.toDomain(entity);

      expect(datapoint.getEnum()).toHaveLength(4);
      expect(datapoint.getEnum()).toContain('Cool');
      expect(datapoint.getEnum()).toContain('Heat');
    });
  });

  describe('fromDomain', () => {
    it('should convert Datapoint domain model to DatapointEntity', () => {
      const datapoint = new Datapoint(
        'dp-1',
        'Power',
        true,
        true,
        'boolean',
        ['On', 'Off'],
        'SFE_Cmd_OnOff',
      );

      const entity = DatapointEntity.fromDomain(datapoint);

      expect(entity.id).toBe('dp-1');
      expect(entity.name).toBe('Power');
      expect(entity.readable).toBe(true);
      expect(entity.writable).toBe(true);
      expect(entity.valueType).toBe('boolean');
      expect(entity.enum).toEqual(['On', 'Off']);
      expect(entity.sfeType).toBe('SFE_Cmd_OnOff');
    });

    it('should convert read-only datapoint', () => {
      const datapoint = new Datapoint(
        'dp-2',
        'Status',
        true,
        false,
        'string',
        [],
        'SFE_Status',
      );

      const entity = DatapointEntity.fromDomain(datapoint);

      expect(entity.readable).toBe(true);
      expect(entity.writable).toBe(false);
    });

    it('should convert write-only datapoint', () => {
      const datapoint = new Datapoint(
        'dp-3',
        'Command',
        false,
        true,
        'string',
        [],
        'SFE_Command',
      );

      const entity = DatapointEntity.fromDomain(datapoint);

      expect(entity.readable).toBe(false);
      expect(entity.writable).toBe(true);
    });

    it('should handle datapoint with empty enum', () => {
      const datapoint = new Datapoint(
        'dp-4',
        'Temperature',
        true,
        false,
        'number',
        [],
        'SFE_Temperature',
      );

      const entity = DatapointEntity.fromDomain(datapoint);

      expect(entity.enum).toEqual([]);
    });

    it('should convert datapoint with multiple enum values', () => {
      const datapoint = new Datapoint(
        'dp-5',
        'Mode',
        true,
        true,
        'string',
        ['Cool', 'Heat', 'Dry', 'Auto'],
        'SFE_Mode',
      );

      const entity = DatapointEntity.fromDomain(datapoint);

      expect(entity.enum).toHaveLength(4);
      expect(entity.enum).toContain('Cool');
    });
  });
});
