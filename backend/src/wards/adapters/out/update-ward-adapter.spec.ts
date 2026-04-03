import { UpdateWardCmd } from '../../application/commands/update-ward-cmd';
import { UpdateWardAdapter } from './update-ward-adapter';

describe('UpdateWardAdapter', () => {
  let adapter: UpdateWardAdapter;

  const mockRepo = {
    updateWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.updateWard.mockReset();
    adapter = new UpdateWardAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.updateWard with correct args', async () => {
    const cmd = new UpdateWardCmd(1, 'new name');
    mockRepo.updateWard.mockResolvedValue({
      id: 1,
      name: 'new name',
    });

    await adapter.updateWard(cmd);

    expect(mockRepo.updateWard).toHaveBeenCalledWith(1, 'new name');
  });

  it('should propagate repository errors', async () => {
    const cmd = new UpdateWardCmd(1, 'new name');
    const error = new Error('repository failure');
    mockRepo.updateWard.mockRejectedValue(error);

    await expect(adapter.updateWard(cmd)).rejects.toThrow(error);
  });
});
