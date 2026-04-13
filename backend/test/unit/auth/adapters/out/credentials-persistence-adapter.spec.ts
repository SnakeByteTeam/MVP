
import { CredentialsPersistenceAdapter } from 'src/auth/adapters/out/credentials-persistence-adapter';
import { ChangeCredentialsCmd } from 'src/auth/application/commands/change-credentials-cmd';
import { CheckCredentialsCmd } from 'src/auth/application/commands/check-credentials-cmd';
import { Payload } from 'src/auth/domain/payload';

describe('CredentialsPersistenceAdapter', () => {
  let adapter: CredentialsPersistenceAdapter;

  const mockCredentialsRepository = {
    checkCredentials: jest.fn(),
    changeCredentials: jest.fn(),
  };

  beforeEach(() => {
    adapter = new CredentialsPersistenceAdapter(
      mockCredentialsRepository as any,
    );
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should call repository and return Payload', async () => {
    const repoResponse = {
      id: 1,
      username: 'user',
      role: 'OPERATORE_SANITARIO',
      firstAccess: true,
    };

    mockCredentialsRepository.checkCredentials.mockResolvedValue(
      repoResponse,
    );

    const cmd = new CheckCredentialsCmd('user', 'pass');

    const result = await adapter.checkCredentials(cmd);

    expect(
      mockCredentialsRepository.checkCredentials,
    ).toHaveBeenCalledWith('user', 'pass');

    expect(result).toBeInstanceOf(Payload);
    expect(result).toEqual(new Payload(1, 'user', 'OPERATORE_SANITARIO', true));
  });

  it('should propagate error from repository', async () => {
    mockCredentialsRepository.checkCredentials.mockRejectedValue(
      new Error('DB error'),
    );

    const cmd = new CheckCredentialsCmd('user', 'pass');

    await expect(adapter.checkCredentials(cmd)).rejects.toThrow('DB error');
  });

    it('should call repository.changeCredentials with correct args', async () => {
      const cmd = new ChangeCredentialsCmd('username', 'newPassword', false);
      mockCredentialsRepository.changeCredentials.mockResolvedValue(undefined);
  
      await adapter.changeCredentials(cmd);
  
      expect(mockCredentialsRepository.changeCredentials).toHaveBeenCalledWith(
        'username',
        'newPassword',
        false,
      );
    });
  
    it('should propagate repository errors', async () => {
      const cmd = new ChangeCredentialsCmd('u', 'p', true);
      const error = new Error('repository failure');
      mockCredentialsRepository.changeCredentials.mockRejectedValue(error);
  
      await expect(adapter.changeCredentials(cmd)).rejects.toThrow(error);
    });
});
