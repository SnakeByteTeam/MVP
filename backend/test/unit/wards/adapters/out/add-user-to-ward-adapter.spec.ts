import { AddUserToWardCmd } from 'src/wards/application/commands/add-user-to-ward-cmd';
import { AddUserToWardAdapter } from 'src/wards/adapters/out/add-user-to-ward-adapter';

describe('AddUserToWardAdapter', () => {
  let adapter: AddUserToWardAdapter;

  const mockRepo = {
    addUserToWard: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.addUserToWard.mockReset();
    adapter = new AddUserToWardAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.addUserToWard with correct args', async () => {
    const cmd = new AddUserToWardCmd(1, 1);
    mockRepo.addUserToWard.mockResolvedValue({
      id: 1,
      name: 'name',
    });

    await adapter.addUserToWard(cmd);

    expect(mockRepo.addUserToWard).toHaveBeenCalledWith(1, 1);
  });

  it('should propagate repository errors', async () => {
    const cmd = new AddUserToWardCmd(1, 1);
    const error = new Error('repository failure');
    mockRepo.addUserToWard.mockRejectedValue(error);

    await expect(adapter.addUserToWard(cmd)).rejects.toThrow(error);
  });
});
