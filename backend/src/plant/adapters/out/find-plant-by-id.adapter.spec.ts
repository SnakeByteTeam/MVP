import { FindPlantByIdAdapter } from './find-plant-by-id.adapter';
import { FindPlantByIdRepoPort } from 'src/plant/application/repository/find-plant-by-id.repository';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import { RoomEntity } from 'src/cache/infrastructure/persistence/entities/room.entity';

describe('FindPlantByIdAdapter', () => {
  let adapter: FindPlantByIdAdapter;
  let repo: jest.Mocked<FindPlantByIdRepoPort>;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
    };

    adapter = new FindPlantByIdAdapter(repo);
  });

  it('should return mapped plant when repository finds entity', async () => {
    const roomEntity = new RoomEntity();
    roomEntity.id = 'room-1';
    roomEntity.name = 'Living Room';
    roomEntity.devices = [];

    const plantEntity = new PlantEntity();
    plantEntity.id = 'plant-1';
    plantEntity.data = {
      name: 'My Plant',
      rooms: [roomEntity],
    };

    repo.findById.mockResolvedValue(plantEntity);

    const result = await adapter.findById({ id: 'plant-1' });

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('plant-1');
    expect(result?.getName()).toBe('My Plant');
    expect(result?.getRooms()).toHaveLength(1);
    expect(result?.getRooms()[0]?.getId()).toBe('room-1');
    expect(repo.findById).toHaveBeenCalledWith('plant-1');
    expect(repo.findById).toHaveBeenCalledTimes(1);
  });

  it('should return null when repository returns null', async () => {
    repo.findById.mockResolvedValue(null);

    const result = await adapter.findById({ id: 'non-existent' });

    expect(result).toBeNull();
    expect(repo.findById).toHaveBeenCalledWith('non-existent');
  });

  it('should throw error when plantId is empty', async () => {
    await expect(adapter.findById({ id: '' })).rejects.toThrow(
      'PlantId is null',
    );
  });

  it('should propagate repository errors', async () => {
    const dbError = new Error('Database connection failed');
    repo.findById.mockRejectedValue(dbError);

    await expect(adapter.findById({ id: 'plant-1' })).rejects.toThrow(dbError);
  });
});
