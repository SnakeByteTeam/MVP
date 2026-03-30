import { FindAllPlantsByWardIdCmd } from '../../application/commands/find-all-plants-by-ward-id-cmd';
import { Plant } from '../../domain/plant';
import { FindAllPlantsByWardIdAdapter } from './find-all-plants-by-ward-id-adapter';

describe('FindAllPlantsByWardIdAdapter', () => {
  let adapter: FindAllPlantsByWardIdAdapter;

  const mockRepo = {
    findAllPlantsByWardId: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.findAllPlantsByWardId.mockReset();
    adapter = new FindAllPlantsByWardIdAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.findAllPlantsByWardId with correct args', async () => {
    const cmd = new FindAllPlantsByWardIdCmd(1);
    mockRepo.findAllPlantsByWardId.mockResolvedValue([]);

    await adapter.findAllPlantsByWardId(cmd);

    expect(mockRepo.findAllPlantsByWardId).toHaveBeenCalledWith(1);
  });

  it('should map PlantEntity to Plant', async () => {
    const mockEntities = [
      { id: 'id1', name: 'plant1' },
      { id: 'id2', name: 'plant2' },
    ];

    mockRepo.findAllPlantsByWardId.mockResolvedValue(mockEntities);

    const result = await adapter.findAllPlantsByWardId(
      new FindAllPlantsByWardIdCmd(1),
    );

    expect(result).toEqual([
      new Plant('id1', 'plant1'),
      new Plant('id2', 'plant2'),
    ]);
  });

  it('should propagate repository errors', async () => {
    const cmd = new FindAllPlantsByWardIdCmd(1);
    const error = new Error('repository failure');
    mockRepo.findAllPlantsByWardId.mockRejectedValue(error);

    await expect(adapter.findAllPlantsByWardId(cmd)).rejects.toThrow(error);
  });
});
