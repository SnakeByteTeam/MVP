import { DeleteUserCmd } from '../../application/commands/delete-user-cmd';
import { DeleteUserAdapter } from './delete-user-adapter';

describe('DeleteUserAdapter', () => {
  let adapter: DeleteUserAdapter;

  const mockRepo = {
    deleteUser: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.deleteUser.mockReset();
    adapter = new DeleteUserAdapter(mockRepo);
  });
  
  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.deleteUser with correct args', async () => {
    const cmd = new DeleteUserCmd(1);
    mockRepo.deleteUser.mockResolvedValue(undefined);
    
    await adapter.deleteUser(cmd);
    
    expect(mockRepo.deleteUser).toHaveBeenCalledWith(1);
  });

  it('should propagate repository errors', async () => {
    const cmd = new DeleteUserCmd(1);
    const error = new Error("Repository error");
    mockRepo.deleteUser.mockRejectedValue(error);

    await expect(adapter.deleteUser(cmd)).rejects.toThrow(error);
  });
});
