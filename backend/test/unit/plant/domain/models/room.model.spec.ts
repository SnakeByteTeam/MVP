import { Room } from 'src/plant/domain/models/room.model';
import { Device } from 'src/device/domain/models/device.model';

describe('Room', () => {
  let mockDevice: Device;

  beforeEach(() => {
    mockDevice = new Device(
      'device-1',
      'plant-1',
      'Light',
      'SF_Light',
      'SS_Light_Switch',
      [],
    );
  });

  it('should create an instance with all properties', () => {
    const room = new Room('room-1', 'Living Room', [mockDevice]);

    expect(room.getId()).toBe('room-1');
    expect(room.getName()).toBe('Living Room');
    expect(room.getDevices()).toHaveLength(1);
  });

  it('should create an instance with empty devices array', () => {
    const room = new Room('room-2', 'Kitchen', []);

    expect(room.getDevices()).toEqual([]);
  });

  it('should copy devices array to prevent external modification', () => {
    const devices = [mockDevice];
    const room = new Room('room-3', 'Bedroom', devices);

    devices.push(
      new Device('device-2', 'plant-1', 'Lamp', 'SF_Lamp', 'SS_Lamp', []),
    );

    expect(room.getDevices()).toHaveLength(1);
  });

  it('should return safe copy of devices array', () => {
    const room = new Room('room-4', 'Living', [mockDevice]);
    const devices1 = room.getDevices();
    const devices2 = room.getDevices();

    devices1.push(
      new Device('device-2', 'plant-1', 'Lamp', 'SF_Lamp', 'SS_Lamp', []),
    );

    expect(room.getDevices()).toHaveLength(1);
    expect(devices2).toHaveLength(1);
  });

  it('should handle rooms with multiple devices', () => {
    const device2 = new Device(
      'device-2',
      'plant-1',
      'Thermostat',
      'SF_Thermostat',
      'SS_Thermostat',
      [],
    );
    const room = new Room('room-5', 'Multi Room', [mockDevice, device2]);

    expect(room.getDevices()).toHaveLength(2);
  });

  it('should create independent room instances', () => {
    const room1 = new Room('room-6', 'Room1', [mockDevice]);
    const room2 = new Room('room-7', 'Room2', []);

    expect(room1.getId()).not.toBe(room2.getId());
    expect(room1.getName()).not.toBe(room2.getName());
    expect(room1.getDevices().length).not.toBe(room2.getDevices().length);
  });

  it('should store and retrieve large device arrays', () => {
    const devices = Array.from(
      { length: 50 },
      (_, i) =>
        new Device(
          `device-${i}`,
          'plant-1',
          `Device ${i}`,
          'SF_Generic',
          'SS_Generic',
          [],
        ),
    );
    const room = new Room('room-8', 'Large Room', devices);

    expect(room.getDevices()).toHaveLength(50);
  });
});
