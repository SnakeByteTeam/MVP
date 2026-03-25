import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Device } from 'src/device/domain/models/device.model';
import { Plant } from './plant.model';
import { Room } from './room.model';

describe('Plant', () => {
  it('should correctly return all attributes', () => {
    const cachedAt = new Date('2026-03-24T10:00:00.000Z');
    const datapoints: Datapoint[] = [
      new Datapoint(
        'dp-1',
        'brightness',
        true,
        true,
        'number',
        ['0', '100'],
        'slider',
      ),
    ];
    const devices: Device[] = [
      new Device('device-1', 'plant-1', 'lamp', 'light', 'dimmer', datapoints),
    ];
    const rooms: Room[] = [new Room('room-1', 'Living Room', devices)];

    const plant = new Plant('plant-1', 'My Plant', rooms, cachedAt);

    expect(plant.getId()).toBe('plant-1');
    expect(plant.getName()).toBe('My Plant');
    expect(plant.getRooms()).toHaveLength(1);
    expect(plant.getCachedAt().toISOString()).toBe(cachedAt.toISOString());
  });

  it('should use defensive copy for rooms and cached date', () => {
    const originalRooms: Room[] = [new Room('room-1', 'Living Room', [])];
    const cachedAt = new Date('2026-03-24T10:00:00.000Z');
    const plant = new Plant('plant-1', 'My Plant', originalRooms, cachedAt);

    originalRooms.push(new Room('room-2', 'Kitchen', []));
    expect(plant.getRooms()).toHaveLength(1);

    const returnedRooms = plant.getRooms();
    returnedRooms.push(new Room('room-3', 'Bedroom', []));
    expect(plant.getRooms()).toHaveLength(1);

    const returnedCachedAt = plant.getCachedAt();
    returnedCachedAt.setFullYear(2000);
    expect(plant.getCachedAt().toISOString()).toBe(cachedAt.toISOString());
  });
});
