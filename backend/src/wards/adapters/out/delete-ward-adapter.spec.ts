import { DeleteWardCmd } from '../../application/commands/delete-ward-cmd';
import { DeleteWardAdapter } from './delete-ward-adapter';

describe('DeleteWardAdapter', () => {
  let adapter: DeleteWardAdapter;

  const mockRepo = {
    deleteWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.deleteWard.mockReset();
    adapter = new DeleteWardAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.deleteWard with correct args', async () => {
    const cmd = new DeleteWardCmd(1);
    mockRepo.deleteWard.mockResolvedValue(undefined);

    adapter.deleteWard(cmd);

    expect(mockRepo.deleteWard).toHaveBeenCalledWith(1);
  });

  it('should propagate repository errors', async () => {
    const cmd = new DeleteWardCmd(1);
    const error = new Error('repository failure');
    mockRepo.deleteWard.mockRejectedValue(error);

    await expect(adapter.deleteWard(cmd)).rejects.toThrow(error);
  });
});
