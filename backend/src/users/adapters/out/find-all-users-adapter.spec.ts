import { FindAllUsersAdapter } from './find-all-users-adapter';

describe('FindAllUsersAdapter', () => {
  let adapter: FindAllUsersAdapter;

  const mockRepo = {
    findAllUsers: jest.fn(),
  }

  beforeEach(() => {
    mockRepo.findAllUsers.mockReset();
    adapter = new FindAllUsersAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.findAllUsers', async () => {
    mockRepo.findAllUsers.mockResolvedValue([
      { id: 1, username: 'user1', surname: 'surname1', name: 'name1' },
      { id: 2, username: 'user2', surname: 'surname2', name: 'name2' },
    ]);

    const result = await adapter.findAllUsers();

    expect(mockRepo.findAllUsers).toHaveBeenCalled();
    expect(result).toEqual([
      { id: 1, username: 'user1', surname: 'surname1', name: 'name1' },
      { id: 2, username: 'user2', surname: 'surname2', name: 'name2' },
    ]);
  });

  it('should propagate repository errors', async () => {
    const error = new Error("Repository error");
    mockRepo.findAllUsers.mockRejectedValue(error);
    await expect(adapter.findAllUsers()).rejects.toThrow(error);
  });
});
