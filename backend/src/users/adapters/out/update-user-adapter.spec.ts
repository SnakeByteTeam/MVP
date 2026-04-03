import { UpdateUserAdapter } from './update-user-adapter';

describe('UpdateUserAdapter', () => {
  let adapter: UpdateUserAdapter;

  const mockRepo = {
    updateUser: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.updateUser.mockReset();
    adapter = new UpdateUserAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.updateUser with correct args', async () => {
    const cmd = { id: 1, username: "username", surname: "surname", name: "name" };
    mockRepo.updateUser.mockResolvedValue({
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
    });

    await adapter.updateUser(cmd);

    expect(mockRepo.updateUser).toHaveBeenCalledWith(1, 'username', 'surname', 'name');
  });

  it('should propagate repository errors', async () => {
    const cmd = { id: 1, username: "username", surname: "surname", name: "name" };
    const error = new Error("Repository error");
    mockRepo.updateUser.mockRejectedValue(error);

    await expect(adapter.updateUser(cmd)).rejects.toThrow(error);
  });
});
