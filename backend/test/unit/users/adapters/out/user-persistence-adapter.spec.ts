import { CreateUserWithTempPasswordCmd } from 'src/users/application/commands/create-user-with-temp-password-cmd';
import { DeleteUserCmd } from 'src/users/application/commands/delete-user-cmd';
import { FindUserByIdCmd } from 'src/users/application/commands/find-user-by-id-cmd';
import { UpdateUserCmd } from 'src/users/application/commands/update-user-cmd';
import { UserPersistenceAdapter } from 'src/users/adapters/out/user-persistence-adapter';

describe('UserPersistenceAdapter', () => {
  let adapter: UserPersistenceAdapter;
  const mockRepo = {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    findAllAvailableUsers: jest.fn(),
    findAllUsers: jest.fn(),
    findUserById: jest.fn(),
    updateUser: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.createUser.mockReset();
    adapter = new UserPersistenceAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.createUser with correct args', async () => {
    const cmd = new CreateUserWithTempPasswordCmd(
      'username',
      'surname',
      'name',
      'tempPassword',
    );
    mockRepo.createUser.mockResolvedValue({
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
    });

    await adapter.createUser(cmd);

    expect(mockRepo.createUser).toHaveBeenCalledWith(
      'username',
      'surname',
      'name',
      'tempPassword',
    );
  });

  it('should propagate repository.createUser errors', async () => {
    const cmd = new CreateUserWithTempPasswordCmd(
      'username',
      'surname',
      'name',
      'tempPassword',
    );
    const error = new Error('Repository error');
    mockRepo.createUser.mockRejectedValue(error);

    await expect(adapter.createUser(cmd)).rejects.toThrow(error);
  });

  it('should call repository.updateUser with correct args', async () => {
    const cmd = new UpdateUserCmd(1, 'username', 'surname', 'name');
    mockRepo.updateUser.mockResolvedValue({
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
    });

    await adapter.updateUser(cmd);

    expect(mockRepo.updateUser).toHaveBeenCalledWith(
      1,
      'username',
      'surname',
      'name',
    );
  });

  it('should propagate repository.updateUser errors', async () => {
    const cmd = new UpdateUserCmd(1, 'username', 'surname', 'name');
    const error = new Error('Repository error');
    mockRepo.updateUser.mockRejectedValue(error);

    await expect(adapter.updateUser(cmd)).rejects.toThrow(error);
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

  it('should propagate repository.findAllAvailableUsers errors', async () => {
    const error = new Error('Repository error');
    mockRepo.findAllAvailableUsers.mockRejectedValue(error);
    await expect(adapter.findAllAvailableUsers()).rejects.toThrow(error);
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

  it('should propagate repository.findAllUsers errors', async () => {
    const error = new Error('Repository error');
    mockRepo.findAllUsers.mockRejectedValue(error);
    await expect(adapter.findAllUsers()).rejects.toThrow(error);
  });

  it('should call repository.deleteUser with correct args', async () => {
    const cmd = new DeleteUserCmd(1);
    mockRepo.deleteUser.mockResolvedValue(undefined);

    await adapter.deleteUser(cmd);

    expect(mockRepo.deleteUser).toHaveBeenCalledWith(1);
  });

  it('should propagate repository.deleteUser errors', async () => {
    const cmd = new DeleteUserCmd(1);
    const error = new Error('Repository error');
    mockRepo.deleteUser.mockRejectedValue(error);

    await expect(adapter.deleteUser(cmd)).rejects.toThrow(error);
  });

  it('should call repository.findUserById with correct args', async () => {
    const cmd = new FindUserByIdCmd(1);
    mockRepo.findUserById.mockResolvedValue(undefined);

    await adapter.findUserById(cmd);

    expect(mockRepo.findUserById).toHaveBeenCalledWith(1);
  });

  it('should call repository.findUserById', async () => {
    const cmd = new FindUserByIdCmd(1);
    mockRepo.findUserById.mockResolvedValue({
      id: 1,
      username: 'user1',
      surname: 'surname1',
      name: 'name1',
    });

    const result = await adapter.findUserById(cmd);

    expect(mockRepo.findUserById).toHaveBeenCalled();
    expect(result).toEqual({
      id: 1,
      username: 'user1',
      surname: 'surname1',
      name: 'name1',
    });
  });

  it('should propagate repository.findUserById errors', async () => {
    const cmd = new FindUserByIdCmd(1);
    const error = new Error('Repository error');
    mockRepo.findUserById.mockRejectedValue(error);

    await expect(adapter.findUserById(cmd)).rejects.toThrow(error);
  });
});
