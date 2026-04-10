import { Device } from 'src/device/domain/models/device.model';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { DeviceEntity } from './device.entity';
import { DatapointEntity } from './datapoint.entity';

describe('DeviceEntity', () => {
  describe('toDomain', () => {
    it('should convert DeviceEntity to Device domain model', () => {
      const datapointEntity = new DatapointEntity();
      datapointEntity.id = 'dp-1';
      datapointEntity.name = 'Power';
      datapointEntity.readable = true;
      datapointEntity.writable = true;
      datapointEntity.valueType = 'boolean';
      datapointEntity.enum = ['On', 'Off'];
      datapointEntity.sfeType = 'SFE_Cmd_OnOff';

      const entity = new DeviceEntity();
      entity.id = 'device-1';
      entity.name = 'Light Switch';
      entity.plantId = 'plant-1';
      entity.type = 'SF_Light';
      entity.subType = 'SS_Light_Switch';
      entity.datapoints = [datapointEntity];

      const device = DeviceEntity.toDomain(entity);

      expect(device).toBeInstanceOf(Device);
      expect(device.getId()).toBe('device-1');
      expect(device.getName()).toBe('Light Switch');
      expect(device.getPlantId()).toBe('plant-1');
      expect(device.getType()).toBe('SF_Light');
      expect(device.getSubType()).toBe('SS_Light_Switch');
      expect(device.getDatapoints()).toHaveLength(1);
      expect(device.getDatapoints()[0].getId()).toBe('dp-1');
    });

    it('should handle device with multiple datapoints', () => {
      const datapointEntity1 = new DatapointEntity();
      datapointEntity1.id = 'dp-1';
      datapointEntity1.name = 'Power';
      datapointEntity1.readable = true;
      datapointEntity1.writable = true;
      datapointEntity1.valueType = 'boolean';
      datapointEntity1.enum = ['On', 'Off'];
      datapointEntity1.sfeType = 'SFE_Cmd_OnOff';

      const datapointEntity2 = new DatapointEntity();
      datapointEntity2.id = 'dp-2';
      datapointEntity2.name = 'Brightness';
      datapointEntity2.readable = true;
      datapointEntity2.writable = true;
      datapointEntity2.valueType = 'number';
      datapointEntity2.enum = [];
      datapointEntity2.sfeType = 'SFE_Slider';

      const entity = new DeviceEntity();
      entity.id = 'device-2';
      entity.name = 'Dimmer Light';
      entity.plantId = 'plant-2';
      entity.type = 'SF_Light';
      entity.subType = 'SS_Light_Dimmer';
      entity.datapoints = [datapointEntity1, datapointEntity2];

      const device = DeviceEntity.toDomain(entity);

      expect(device.getDatapoints()).toHaveLength(2);
      expect(device.getDatapoints()[0].getName()).toBe('Power');
      expect(device.getDatapoints()[1].getName()).toBe('Brightness');
    });

    it('should handle device with no datapoints', () => {
      const entity = new DeviceEntity();
      entity.id = 'device-3';
      entity.name = 'Empty Device';
      entity.plantId = 'plant-3';
      entity.type = 'SF_Generic';
      entity.subType = 'SS_Generic';
      entity.datapoints = [];

      const device = DeviceEntity.toDomain(entity);

      expect(device.getDatapoints()).toEqual([]);
    });
  });

  describe('fromDomain', () => {
    it('should convert Device domain model to DeviceEntity', () => {
      const datapoint = new Datapoint(
        'dp-1',
        'Power',
        true,
        true,
        'boolean',
        ['On', 'Off'],
        'SFE_Cmd_OnOff',
      );
      const device = new Device(
        'device-1',
        'plant-1',
        'Light Switch',
        'SF_Light',
        'SS_Light_Switch',
        [datapoint],
      );

      const entity = DeviceEntity.fromDomain(device);

      expect(entity.id).toBe('device-1');
      expect(entity.name).toBe('Light Switch');
      expect(entity.plantId).toBe('plant-1');
      expect(entity.type).toBe('SF_Light');
      expect(entity.subType).toBe('SS_Light_Switch');
      expect(entity.datapoints).toHaveLength(1);
      expect(entity.datapoints[0].id).toBe('dp-1');
    });

    it('should convert device with multiple datapoints', () => {
      const datapoints = [
        new Datapoint(
          'dp-1',
          'Power',
          true,
          true,
          'boolean',
          ['On', 'Off'],
          'SFE_Cmd_OnOff',
        ),
        new Datapoint(
          'dp-2',
          'Brightness',
          true,
          true,
          'number',
          [],
          'SFE_Slider',
        ),
      ];
      const device = new Device(
        'device-2',
        'plant-2',
        'Dimmer Light',
        'SF_Light',
        'SS_Light_Dimmer',
        datapoints,
      );

      const entity = DeviceEntity.fromDomain(device);

      expect(entity.datapoints).toHaveLength(2);
      expect(entity.datapoints[0].name).toBe('Power');
      expect(entity.datapoints[1].name).toBe('Brightness');
    });

    it('should convert device with no datapoints', () => {
      const device = new Device(
        'device-3',
        'plant-3',
        'Empty Device',
        'SF_Generic',
        'SS_Generic',
        [],
      );

      const entity = DeviceEntity.fromDomain(device);

      expect(entity.datapoints).toEqual([]);
    });
  });
});
