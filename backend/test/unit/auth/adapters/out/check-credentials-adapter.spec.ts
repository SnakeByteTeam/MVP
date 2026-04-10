import { CheckCredentialsAdapter } from 'src/auth/adapters/out/check-credentials-adapter';
import { CheckCredentialsCmd } from 'src/auth/application/commands/check-credentials-cmd';
import { Payload } from 'src/auth/domain/payload';

describe('CheckCredentialsAdapter', () => {
  let adapter: CheckCredentialsAdapter;

  const mockCheckCredentialsRepository = {
    checkCredentials: jest.fn(),
  };

  beforeEach(() => {
    adapter = new CheckCredentialsAdapter(
      mockCheckCredentialsRepository as any,
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

    mockCheckCredentialsRepository.checkCredentials.mockResolvedValue(
      repoResponse,
    );

    const cmd = new CheckCredentialsCmd('user', 'pass');

    const result = await adapter.checkCredentials(cmd);

    expect(
      mockCheckCredentialsRepository.checkCredentials,
    ).toHaveBeenCalledWith('user', 'pass');

    expect(result).toBeInstanceOf(Payload);
    expect(result).toEqual(new Payload(1, 'user', 'OPERATORE_SANITARIO', true));
  });

  it('should propagate error from repository', async () => {
    mockCheckCredentialsRepository.checkCredentials.mockRejectedValue(
      new Error('DB error'),
    );

    const cmd = new CheckCredentialsCmd('user', 'pass');

    await expect(adapter.checkCredentials(cmd)).rejects.toThrow('DB error');
  });
});
