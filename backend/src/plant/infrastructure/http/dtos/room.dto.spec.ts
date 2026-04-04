import { RoomDto } from './room.dto';
import { Room } from 'src/plant/domain/models/room.model';
import { Device } from 'src/device/domain/models/device.model';
import { DeviceDto } from 'src/device/infrastructure/http/dtos/out/device.dto';

describe('RoomDto', () => {
  let mockDeviceDto: DeviceDto;
  let mockDevice: Device;

  beforeEach(() => {
    mockDeviceDto = {
      id: 'device-1',
      name: 'Light',
      plantId: 'plant-1',
      type: 'SF_Light',
      subType: 'SS_Light_Switch',
      datapoints: [],
    };

    mockDevice = new Device(
      'device-1',
      'plant-1',
      'Light',
      'SF_Light',
      'SS_Light_Switch',
      [],
    );
  });

  describe('toDomain', () => {
    it('should convert RoomDto to Room domain model', () => {
      const roomDto = new RoomDto();
      roomDto.id = 'room-1';
      roomDto.name = 'Living Room';
      roomDto.devices = [mockDeviceDto];

      const room = RoomDto.toDomain(roomDto);

      expect(room).toBeInstanceOf(Room);
      expect(room.getId()).toBe('room-1');
      expect(room.getName()).toBe('Living Room');
      expect(room.getDevices()).toHaveLength(1);
    });

    it('should handle empty devices array', () => {
      const roomDto = new RoomDto();
      roomDto.id = 'room-2';
      roomDto.name = 'Kitchen';
      roomDto.devices = [];

      const room = RoomDto.toDomain(roomDto);

      expect(room.getDevices()).toHaveLength(0);
    });

    it('should handle multiple devices', () => {
      const roomDto = new RoomDto();
      roomDto.id = 'room-3';
      roomDto.name = 'Bedroom';
      roomDto.devices = [
        {
          ...mockDeviceDto,
          id: 'device-1',
          name: 'Lamp',
        },
        {
          ...mockDeviceDto,
          id: 'device-2',
          name: 'Thermostat',
        },
      ];

      const room = RoomDto.toDomain(roomDto);

      expect(room.getDevices()).toHaveLength(2);
    });
  });

  describe('fromDomain', () => {
    it('should convert Room domain model to RoomDto', () => {
      const room = new Room('room-1', 'Living Room', [mockDevice]);

      const roomDto = RoomDto.fromDomain(room);

      expect(roomDto).toBeInstanceOf(RoomDto);
      expect(roomDto.id).toBe('room-1');
      expect(roomDto.name).toBe('Living Room');
      expect(roomDto.devices).toHaveLength(1);
      expect(roomDto.devices[0].id).toBe('device-1');
    });

    it('should handle room with no devices', () => {
      const room = new Room('room-2', 'Empty Room', []);

      const roomDto = RoomDto.fromDomain(room);

      expect(roomDto.devices).toHaveLength(0);
    });

    it('should convert multiple devices correctly', () => {
      const device1 = new Device(
        'device-1',
        'plant-1',
        'Light',
        'SF_Light',
        'SS_Light',
        [],
      );
      const device2 = new Device(
        'device-2',
        'plant-1',
        'Thermostat',
        'SF_Thermostat',
        'SS_Thermostat',
        [],
      );
      const room = new Room('room-3', 'Multi-Device Room', [device1, device2]);

      const roomDto = RoomDto.fromDomain(room);

      expect(roomDto.devices).toHaveLength(2);
      expect(roomDto.devices[0].name).toBe('Light');
      expect(roomDto.devices[1].name).toBe('Thermostat');
    });

    it('should preserve all room properties during conversion', () => {
      const room = new Room('room-4', 'Test Room', [mockDevice]);

      const roomDto = RoomDto.fromDomain(room);

      expect(roomDto.id).toBe(room.getId());
      expect(roomDto.name).toBe(room.getName());
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity in round-trip conversion', () => {
      const originalRoom = new Room('room-5', 'Round Trip Room', [mockDevice]);

      const roomDto = RoomDto.fromDomain(originalRoom);
      const convertedRoom = RoomDto.toDomain(roomDto);

      expect(convertedRoom.getId()).toBe(originalRoom.getId());
      expect(convertedRoom.getName()).toBe(originalRoom.getName());
      expect(convertedRoom.getDevices()).toHaveLength(
        originalRoom.getDevices().length,
      );
    });
  });
});
