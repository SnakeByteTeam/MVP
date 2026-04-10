import { FindAllUsersByWardIdCmd } from 'src/wards/application/commands/find-all-users-by-ward-id-cmd';
import { User } from 'src/wards/domain/user';
import { FindAllUsersByWardIdAdapter } from 'src/wards/adapters/out/find-all-users-by-ward-id-adapter';

describe('FindAllUsersByWardIdAdapter', () => {
  let adapter: FindAllUsersByWardIdAdapter;

  const mockRepo = {
    findAllUsersByWardId: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.findAllUsersByWardId.mockReset();
    adapter = new FindAllUsersByWardIdAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.findAllUsersByWardId with correct args', async () => {
    const cmd = new FindAllUsersByWardIdCmd(1);
    mockRepo.findAllUsersByWardId.mockResolvedValue([]);

    await adapter.findAllUsersByWardId(cmd);

    expect(mockRepo.findAllUsersByWardId).toHaveBeenCalledWith(1);
  });

  it('should map UserEntity to User', async () => {
    const mockEntities = [
      { id: 1, username: 'user1' },
      { id: 2, username: 'user2' },
    ];

    mockRepo.findAllUsersByWardId.mockResolvedValue(mockEntities);

    const result = await adapter.findAllUsersByWardId(
      new FindAllUsersByWardIdCmd(1),
    );

    expect(result).toEqual([new User(1, 'user1'), new User(2, 'user2')]);
  });

  it('should propagate repository errors', async () => {
    const cmd = new FindAllUsersByWardIdCmd(1);
    const error = new Error('repository failure');
    mockRepo.findAllUsersByWardId.mockRejectedValue(error);

    await expect(adapter.findAllUsersByWardId(cmd)).rejects.toThrow(error);
  });
});
