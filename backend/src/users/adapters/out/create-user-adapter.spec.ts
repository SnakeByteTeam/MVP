import { CreateUserWithTempPasswordCmd } from '../../application/commands/create-user-with-temp-password-cmd';
import { CreateUserAdapter } from './create-user-adapter';

describe('CreateUserAdapter', () => {
  let adapter: CreateUserAdapter;

  const mockRepo = {
    createUser: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.createUser.mockReset();
    adapter = new CreateUserAdapter(mockRepo);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.createUser with correct args', async () => {
    const cmd = new CreateUserWithTempPasswordCmd("username", "surname", "name", "tempPassword");
    mockRepo.createUser.mockResolvedValue({
      id: 1,
      username: 'username',
      surname: 'surname',
      name: 'name',
    });

    await adapter.createUser(cmd);

    expect(mockRepo.createUser).toHaveBeenCalledWith('username', 'surname', 'name', 'tempPassword');
  });

  it('should propagate repository errors', async () => {
    const cmd = new CreateUserWithTempPasswordCmd("username", "surname", "name", "tempPassword");
    const error = new Error("Repository error");
    mockRepo.createUser.mockRejectedValue(error);

    await expect(adapter.createUser(cmd)).rejects.toThrow(error);
  });
});
