import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Device } from 'src/device/domain/models/device.model';
import { WritePlantStructureRepoPort } from 'src/plant/application/repository/write-plant-structure.repository';
import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';
import { WritePlantStructureAdapter } from './write-plant-structure.adapter';

describe('WritePlantStructureAdapter', () => {
  let adapter: WritePlantStructureAdapter;
  let repoPort: jest.Mocked<WritePlantStructureRepoPort>;

  beforeEach(() => {
    repoPort = {
      write: jest.fn(),
    };

    adapter = new WritePlantStructureAdapter(repoPort);
  });

  it('should map plant to entity and write it to repository', async () => {
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
    const plant = new Plant(
      'plant-1',
      'My Plant',
      rooms,
      new Date('2026-03-24T12:00:00.000Z'),
    );

    repoPort.write.mockResolvedValue(true);

    const result = await adapter.writeStructure(plant);

    expect(repoPort.write).toHaveBeenCalledTimes(1);
    const writtenEntity = repoPort.write.mock.calls[0][0];
    expect(writtenEntity.data.id).toBe('plant-1');
    expect(writtenEntity.data.name).toBe('My Plant');
    expect(writtenEntity.cached_at.toISOString()).toBe(
      '2026-03-24T12:00:00.000Z',
    );
    expect(result).toBe(true);
  });
});
