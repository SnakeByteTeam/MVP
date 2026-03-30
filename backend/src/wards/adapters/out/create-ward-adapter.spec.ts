import { CreateWardCmd } from '../../application/commands/create-ward-cmd';
import { CreateWardAdapter } from './create-ward-adapter';

describe('CreateWardAdapter', () => {
  let adapter: CreateWardAdapter;

  const mockRepo = {
    createWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.createWard.mockReset();
    adapter = new CreateWardAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.createWard with correct args', async () => {
    const cmd = new CreateWardCmd('name');
    mockRepo.createWard.mockResolvedValue({
      id: 1,
      name: 'name',
    });

    await adapter.createWard(cmd);

    expect(mockRepo.createWard).toHaveBeenCalledWith('name');
  });

  it('should propagate repository errors', async () => {
    const cmd = new CreateWardCmd('name');
    const error = new Error('repository failure');
    mockRepo.createWard.mockRejectedValue(error);

    await expect(adapter.createWard(cmd)).rejects.toThrow(error);
  });
});
