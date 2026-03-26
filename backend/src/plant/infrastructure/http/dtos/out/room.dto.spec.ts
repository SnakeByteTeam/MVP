import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Device } from 'src/device/domain/models/device.model';
import { DatapointDto } from 'src/device/infrastructure/dtos/datapoint.dto';
import { DeviceDto } from 'src/device/infrastructure/dtos/device.dto';
import { Room } from 'src/plant/domain/models/room.model';
import { RoomDto } from './room.dto';

describe('RoomDto', () => {
  describe('toDomain', () => {
    it('should map RoomDto to Room domain model', () => {
      const dpDto = new DatapointDto();
      dpDto.id = 'dp-1';
      dpDto.name = 'brightness';
      dpDto.readable = true;
      dpDto.writable = true;
      dpDto.valueType = 'number';
      dpDto.enum = ['0', '100'];
      dpDto.sfeType = 'slider';

      const deviceDto = new DeviceDto();
      deviceDto.id = 'dev-1';
      deviceDto.name = 'Lamp';
      deviceDto.plantId = 'plant-1';
      deviceDto.type = 'light';
      deviceDto.subType = 'dimmer';
      deviceDto.datapoints = [dpDto];

      const roomDto = new RoomDto();
      roomDto.id = 'room-1';
      roomDto.name = 'Living Room';
      roomDto.devices = [deviceDto];

      const room = RoomDto.toDomain(roomDto);

      expect(room).toBeInstanceOf(Room);
      expect(room.getId()).toBe('room-1');
      expect(room.getName()).toBe('Living Room');
      expect(room.getDevices()).toHaveLength(1);
      expect(room.getDevices()[0].getDatapoints()).toHaveLength(1);
    });

    it('should handle room without devices', () => {
      const roomDto = new RoomDto();
      roomDto.id = 'room-2';
      roomDto.name = 'Bedroom';
      roomDto.devices = [];

      const room = RoomDto.toDomain(roomDto);

      expect(room).toBeInstanceOf(Room);
      expect(room.getId()).toBe('room-2');
      expect(room.getName()).toBe('Bedroom');
      expect(room.getDevices()).toHaveLength(0);
    });

    it('should handle room with multiple devices and datapoints', () => {
      const dp1Dto = new DatapointDto();
      dp1Dto.id = 'dp-1';
      dp1Dto.name = 'temperature';
      dp1Dto.readable = true;
      dp1Dto.writable = false;
      dp1Dto.valueType = 'number';
      dp1Dto.enum = [];
      dp1Dto.sfeType = 'sensor';

      const dp2Dto = new DatapointDto();
      dp2Dto.id = 'dp-2';
      dp2Dto.name = 'humidity';
      dp2Dto.readable = true;
      dp2Dto.writable = false;
      dp2Dto.valueType = 'number';
      dp2Dto.enum = [];
      dp2Dto.sfeType = 'sensor';

      const device1Dto = new DeviceDto();
      device1Dto.id = 'dev-1';
      device1Dto.name = 'Temperature Sensor';
      device1Dto.plantId = 'plant-1';
      device1Dto.type = 'sensor';
      device1Dto.subType = 'climate';
      device1Dto.datapoints = [dp1Dto, dp2Dto];

      const device2Dto = new DeviceDto();
      device2Dto.id = 'dev-2';
      device2Dto.name = 'Light Controller';
      device2Dto.plantId = 'plant-1';
      device2Dto.type = 'light';
      device2Dto.subType = 'dimmer';
      device2Dto.datapoints = [];

      const roomDto = new RoomDto();
      roomDto.id = 'room-1';
      roomDto.name = 'Kitchen';
      roomDto.devices = [device1Dto, device2Dto];

      const room = RoomDto.toDomain(roomDto);

      expect(room).toBeInstanceOf(Room);
      expect(room.getDevices()).toHaveLength(2);
      expect(room.getDevices()[0].getDatapoints()).toHaveLength(2);
      expect(room.getDevices()[1].getDatapoints()).toHaveLength(0);
    });
  });

  describe('fromDomain', () => {
    it('should map Room domain model to RoomDto', () => {
      const datapoint = new Datapoint(
        'dp-1',
        'brightness',
        true,
        true,
        'number',
        ['0', '100'],
        'slider',
      );

      const device = new Device(
        'dev-1',
        'Lamp',
        'plant-1',
        'light',
        'dimmer',
        [datapoint],
      );

      const room = new Room('room-1', 'Living Room', [device]);

      const roomDto = RoomDto.fromDomain(room);

      expect(roomDto).toBeInstanceOf(RoomDto);
      expect(roomDto.id).toBe('room-1');
      expect(roomDto.name).toBe('Living Room');
      expect(roomDto.devices).toHaveLength(1);
      expect(roomDto.devices[0].id).toBe('dev-1');
      expect(roomDto.devices[0].datapoints).toHaveLength(1);
    });

    it('should handle room domain without devices', () => {
      const room = new Room('room-2', 'Empty Room', []);

      const roomDto = RoomDto.fromDomain(room);

      expect(roomDto).toBeInstanceOf(RoomDto);
      expect(roomDto.id).toBe('room-2');
      expect(roomDto.name).toBe('Empty Room');
      expect(roomDto.devices).toHaveLength(0);
    });

    it('should preserve device and datapoint information when converting', () => {
      const dp1 = new Datapoint(
        'dp-1',
        'temperature',
        true,
        false,
        'number',
        [],
        'sensor',
      );

      const dp2 = new Datapoint(
        'dp-2',
        'humidity',
        true,
        false,
        'number',
        [],
        'sensor',
      );

      const device1 = new Device(
        'dev-1',
        'Climate Sensor',
        'plant-1',
        'sensor',
        'climate',
        [dp1, dp2],
      );

      const device2 = new Device(
        'dev-2',
        'Light',
        'plant-1',
        'light',
        'dimmer',
        [],
      );

      const room = new Room('room-1', 'Kitchen', [device1, device2]);

      const roomDto = RoomDto.fromDomain(room);

      expect(roomDto.devices).toHaveLength(2);
      expect(roomDto.devices[0].datapoints).toHaveLength(2);
      expect(roomDto.devices[0].datapoints[0].name).toBe('temperature');
      expect(roomDto.devices[0].datapoints[1].name).toBe('humidity');
      expect(roomDto.devices[1].datapoints).toHaveLength(0);
    });
  });

  describe('roundtrip conversion', () => {
    it('should preserve data when converting from domain and back', () => {
      const datapoint = new Datapoint(
        'dp-1',
        'brightness',
        true,
        true,
        'number',
        ['0', '100'],
        'slider',
      );

      const device = new Device(
        'dev-1',
        'Lamp',
        'plant-1',
        'light',
        'dimmer',
        [datapoint],
      );

      const originalRoom = new Room('room-1', 'Living Room', [device]);

      const roomDto = RoomDto.fromDomain(originalRoom);
      const restoredRoom = RoomDto.toDomain(roomDto);

      expect(restoredRoom.getId()).toBe(originalRoom.getId());
      expect(restoredRoom.getName()).toBe(originalRoom.getName());
      expect(restoredRoom.getDevices()).toHaveLength(
        originalRoom.getDevices().length,
      );
    });
  });
});
