import { ChangeCredentialsAdapter } from './change-credentials-adapter';
import { ChangeCredentialsCmd } from '../../application/commands/change-credentials-cmd';

describe('ChangeCredentialsAdapter', () => {
  let adapter: ChangeCredentialsAdapter;
  const mockRepo = {
    changeCredentials: jest.fn(),
  };

  beforeEach(() => {
    mockRepo.changeCredentials.mockReset();
    adapter = new ChangeCredentialsAdapter(mockRepo as any);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository.changeCredentials with correct args', async () => {
    const cmd = new ChangeCredentialsCmd('username', 'newPassword', false);
    mockRepo.changeCredentials.mockResolvedValue(undefined);

    await adapter.changeCredentials(cmd);

    expect(mockRepo.changeCredentials).toHaveBeenCalledWith(
      'username',
      'newPassword',
      false,
    );
  });

  it('should propagate repository errors', async () => {
    const cmd = new ChangeCredentialsCmd('u', 'p', true);
    const error = new Error('repository failure');
    mockRepo.changeCredentials.mockRejectedValue(error);

    await expect(adapter.changeCredentials(cmd)).rejects.toThrow(error);
  });
});
