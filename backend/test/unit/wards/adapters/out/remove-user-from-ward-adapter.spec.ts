import { RemoveUserFromWardCmd } from 'src/wards/application/commands/remove-user-from-ward-cmd';
import { RemoveUserFromWardAdapter } from 'src/wards/adapters/out/remove-user-from-ward-adapter';

describe('RemoveUserFromWardAdapter', () => {
  let adapter: RemoveUserFromWardAdapter;

  const mockRepo = {
    removeUserFromWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.removeUserFromWard.mockReset();
    adapter = new RemoveUserFromWardAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.removeUserFromWard with correct args', async () => {
    const cmd = new RemoveUserFromWardCmd(1, 1);
    mockRepo.removeUserFromWard.mockResolvedValue(undefined);

    await adapter.removeUserFromWard(cmd);

    expect(mockRepo.removeUserFromWard).toHaveBeenCalledWith(1, 1);
  });

  it('should propagate repository errors', async () => {
    const cmd = new RemoveUserFromWardCmd(1, 1);
    const error = new Error('repository failure');
    mockRepo.removeUserFromWard.mockRejectedValue(error);

    await expect(adapter.removeUserFromWard(cmd)).rejects.toThrow(error);
  });
});
