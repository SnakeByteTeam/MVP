import { FindAllAvailableUsersAdapter } from './find-all-available-users-adapter';

describe('FindAllAvailableUsersAdapter', () => {
  let adapter: FindAllAvailableUsersAdapter;

  const mockRepo = {
    findAllAvailableUsers: jest.fn(),
  }

  beforeEach(() => {
    mockRepo.findAllAvailableUsers.mockReset();
    adapter = new FindAllAvailableUsersAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.findAllAvailableUsers', async () => {
    mockRepo.findAllAvailableUsers.mockResolvedValue([
      { id: 1, username: 'user1', surname: 'surname1', name: 'name1' },
      { id: 2, username: 'user2', surname: 'surname2', name: 'name2' },
    ]);

    const result = await adapter.findAllAvailableUsers();

    expect(mockRepo.findAllAvailableUsers).toHaveBeenCalled();
    expect(result).toEqual([
      { id: 1, username: 'user1', surname: 'surname1', name: 'name1' },
      { id: 2, username: 'user2', surname: 'surname2', name: 'name2' },
    ]);
  });

  it('should propagate repository errors', async () => {
    const error = new Error("Repository error");
    mockRepo.findAllAvailableUsers.mockRejectedValue(error);
    await expect(adapter.findAllAvailableUsers()).rejects.toThrow(error);
  });
});
