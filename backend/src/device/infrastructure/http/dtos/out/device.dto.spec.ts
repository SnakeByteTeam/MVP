import { DeviceDto } from './device.dto';
import { Device } from 'src/device/domain/models/device.model';
import { DatapointDto } from './datapoint.dto';
import { Datapoint } from 'src/device/domain/models/datapoint.model';

describe('DeviceDto', () => {
  let mockDatapointDto: DatapointDto;
  let mockDatapoint: Datapoint;

  beforeEach(() => {
    mockDatapointDto = {
      id: 'dp-1',
      name: 'Power',
      readable: true,
      writable: true,
      valueType: 'string',
      enum: ['Off', 'On'],
      sfeType: 'SFE_Cmd_OnOff',
    };

    mockDatapoint = new Datapoint(
      'dp-1',
      'Power',
      true,
      true,
      'string',
      ['Off', 'On'],
      'SFE_Cmd_OnOff',
    );
  });

  describe('toDomain', () => {
    it('should convert DeviceDto to Device domain model', () => {
      const deviceDto = new DeviceDto();
      deviceDto.id = 'device-1';
      deviceDto.name = 'Light Switch';
      deviceDto.plantId = 'plant-1';
      deviceDto.type = 'SF_Light';
      deviceDto.subType = 'SS_Light_Switch';
      deviceDto.datapoints = [mockDatapointDto];

      const device = DeviceDto.toDomain(deviceDto);

      expect(device).toBeInstanceOf(Device);
      expect(device.getId()).toBe('device-1');
      expect(device.getName()).toBe('Light Switch');
      expect(device.getPlantId()).toBe('plant-1');
      expect(device.getType()).toBe('SF_Light');
      expect(device.getSubType()).toBe('SS_Light_Switch');
      expect(device.getDatapoints()).toHaveLength(1);
    });

    it('should handle empty datapoints array', () => {
      const deviceDto = new DeviceDto();
      deviceDto.id = 'device-2';
      deviceDto.name = 'Thermostat';
      deviceDto.plantId = 'plant-1';
      deviceDto.type = 'SF_Thermostat';
      deviceDto.subType = 'SS_Thermostat';
      deviceDto.datapoints = [];

      const device = DeviceDto.toDomain(deviceDto);

      expect(device.getDatapoints()).toHaveLength(0);
    });

    it('should handle multiple datapoints', () => {
      const deviceDto = new DeviceDto();
      deviceDto.id = 'device-3';
      deviceDto.name = 'Multi-function Device';
      deviceDto.plantId = 'plant-1';
      deviceDto.type = 'SF_Multi';
      deviceDto.subType = 'SS_Multi';
      deviceDto.datapoints = [
        mockDatapointDto,
        { ...mockDatapointDto, id: 'dp-2' },
      ];

      const device = DeviceDto.toDomain(deviceDto);

      expect(device.getDatapoints()).toHaveLength(2);
    });
  });

  describe('fromDomain', () => {
    it('should convert Device domain model to DeviceDto', () => {
      const device = new Device(
        'device-1',
        'plant-1',
        'Light Switch',
        'SF_Light',
        'SS_Light_Switch',
        [mockDatapoint],
      );

      const deviceDto = DeviceDto.fromDomain(device);

      expect(deviceDto).toBeInstanceOf(DeviceDto);
      expect(deviceDto.id).toBe('device-1');
      expect(deviceDto.name).toBe('Light Switch');
      expect(deviceDto.plantId).toBe('plant-1');
      expect(deviceDto.type).toBe('SF_Light');
      expect(deviceDto.subType).toBe('SS_Light_Switch');
      expect(deviceDto.datapoints).toHaveLength(1);
    });

    it('should handle device with no datapoints', () => {
      const device = new Device(
        'device-2',
        'plant-1',
        'Empty Device',
        'SF_Empty',
        'SS_Empty',
        [],
      );

      const deviceDto = DeviceDto.fromDomain(device);

      expect(deviceDto.datapoints).toHaveLength(0);
    });

    it('should convert multiple datapoints correctly', () => {
      const datapoint1 = new Datapoint(
        'dp-1',
        'Power',
        true,
        true,
        'string',
        ['Off', 'On'],
        'SFE_Cmd_OnOff',
      );
      const datapoint2 = new Datapoint(
        'dp-2',
        'Temperature',
        true,
        false,
        'number',
        [],
        'SFE_State_Temperature',
      );
      const device = new Device(
        'device-3',
        'plant-1',
        'Multi Device',
        'SF_Multi',
        'SS_Multi',
        [datapoint1, datapoint2],
      );

      const deviceDto = DeviceDto.fromDomain(device);

      expect(deviceDto.datapoints).toHaveLength(2);
      expect(deviceDto.datapoints[0].name).toBe('Power');
      expect(deviceDto.datapoints[1].name).toBe('Temperature');
    });

    it('should preserve all device properties during conversion', () => {
      const device = new Device(
        'device-4',
        'plant-1',
        'Test Device',
        'SF_Test',
        'SS_Test',
        [mockDatapoint],
      );

      const deviceDto = DeviceDto.fromDomain(device);

      expect(deviceDto.id).toBe(device.getId());
      expect(deviceDto.name).toBe(device.getName());
      expect(deviceDto.plantId).toBe(device.getPlantId());
      expect(deviceDto.type).toBe(device.getType());
      expect(deviceDto.subType).toBe(device.getSubType());
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity in round-trip conversion', () => {
      const originalDevice = new Device(
        'device-5',
        'plant-1',
        'Round Trip Device',
        'SF_Round',
        'SS_Round',
        [mockDatapoint],
      );

      const deviceDto = DeviceDto.fromDomain(originalDevice);
      const convertedDevice = DeviceDto.toDomain(deviceDto);

      expect(convertedDevice.getId()).toBe(originalDevice.getId());
      expect(convertedDevice.getName()).toBe(originalDevice.getName());
      expect(convertedDevice.getPlantId()).toBe(originalDevice.getPlantId());
      expect(convertedDevice.getType()).toBe(originalDevice.getType());
      expect(convertedDevice.getSubType()).toBe(originalDevice.getSubType());
      expect(convertedDevice.getDatapoints()).toHaveLength(
        originalDevice.getDatapoints().length,
      );
    });
  });
});
