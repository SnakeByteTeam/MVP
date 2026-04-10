import { AddPlantToWardCmd } from 'src/wards/application/commands/add-plant-to-ward-cmd';
import { AddPlantToWardAdapter } from 'src/wards/adapters/out/add-plant-to-ward-adapter';

describe('AddPlantToWardAdapter', () => {
  let adapter: AddPlantToWardAdapter;

  const mockRepo = {
    addPlantToWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.addPlantToWard.mockReset();
    adapter = new AddPlantToWardAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.addPlantToWard with correct args', async () => {
    const cmd = new AddPlantToWardCmd(1, 'id');
    mockRepo.addPlantToWard.mockResolvedValue({
      id: 1,
      name: 'new name',
    });

    await adapter.addPlantToWard(cmd);

    expect(mockRepo.addPlantToWard).toHaveBeenCalledWith(1, 'id');
  });

  it('should propagate repository errors', async () => {
    const cmd = new AddPlantToWardCmd(1, 'id');
    const error = new Error('repository failure');
    mockRepo.addPlantToWard.mockRejectedValue(error);

    await expect(adapter.addPlantToWard(cmd)).rejects.toThrow(error);
  });
});
