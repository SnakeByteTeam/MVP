import { RemovePlantFromWardCmd } from 'src/wards/application/commands/remove-plant-from-ward-cmd';
import { RemovePlantFromWardAdapter } from 'src/wards/adapters/out/remove-plant-from-ward-adapter';

describe('RemovePlantFromWardAdapter', () => {
  let adapter: RemovePlantFromWardAdapter;

  const mockRepo = {
    removePlantFromWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.removePlantFromWard.mockReset();
    adapter = new RemovePlantFromWardAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.removePlantFromWard with correct args', async () => {
    const cmd = new RemovePlantFromWardCmd('id');
    mockRepo.removePlantFromWard.mockResolvedValue(undefined);

    await adapter.removePlantFromWard(cmd);

    expect(mockRepo.removePlantFromWard).toHaveBeenCalledWith('id');
  });

  it('should propagate repository errors', async () => {
    const cmd = new RemovePlantFromWardCmd('id');
    const error = new Error('repository failure');
    mockRepo.removePlantFromWard.mockRejectedValue(error);

    await expect(adapter.removePlantFromWard(cmd)).rejects.toThrow(error);
  });
});
