import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Device } from 'src/device/domain/models/device.model';
import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';
import { PlantEntity } from './plant.entity';

describe('PlantEntity', () => {
  it('should map from domain to entity preserving cached_at', () => {
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
      new Device('dev-1', 'plant-1', 'Lamp', 'light', 'dimmer', datapoints),
    ];
    const rooms: Room[] = [new Room('room-1', 'Living Room', devices)];
    const plant = new Plant('plant-1', 'My Plant', rooms, cachedAt);

    const entity = PlantEntity.fromDomain(plant);

    expect(entity.cached_at.toISOString()).toBe(cachedAt.toISOString());
    expect(entity.data.id).toBe('plant-1');
    expect(entity.data.name).toBe('My Plant');
    expect(entity.data.rooms).toHaveLength(1);
  });

  it('should map from entity to domain preserving cached_at', () => {
    const cachedAt = new Date('2026-03-24T10:00:00.000Z');
    const entity = new PlantEntity();
    entity.cached_at = cachedAt;
    entity.data = {
      id: 'plant-1',
      name: 'My Plant',
      rooms: [
        {
          id: 'room-1',
          name: 'Living Room',
          devices: [
            {
              id: 'dev-1',
              plantId: 'plant-1',
              name: 'Lamp',
              type: 'light',
              subType: 'dimmer',
              datapoints: [
                {
                  id: 'dp-1',
                  name: 'brightness',
                  readable: true,
                  writable: true,
                  valueType: 'number',
                  enum: ['0', '100'],
                  sfeType: 'slider',
                },
              ],
            },
          ],
        },
      ],
    };

    const plant = PlantEntity.toDomain(entity);

    expect(plant).toBeInstanceOf(Plant);
    expect(plant.getId()).toBe('plant-1');
    expect(plant.getName()).toBe('My Plant');
    expect(plant.getCachedAt().toISOString()).toBe(cachedAt.toISOString());
    expect(plant.getRooms()).toHaveLength(1);
  });
});
