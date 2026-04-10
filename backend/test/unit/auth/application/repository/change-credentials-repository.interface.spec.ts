import {
  CHANGE_CREDENTIALS_REPOSITORY,
  ChangeCredentialsRepository,
} from 'src/auth/application/repository/change-credentials-repository.interface';

describe('ChangeCredentialsRepository token', () => {
  it('espone il token DI atteso', () => {
    expect(CHANGE_CREDENTIALS_REPOSITORY).toBe('CHANGE_CREDENTIALS_REPOSITORY');
  });

  it('definisce il contratto changeCredentials', async () => {
    const repository: ChangeCredentialsRepository = {
      changeCredentials: jest.fn().mockResolvedValue(undefined),
    };

    await expect(repository.changeCredentials('mario', 'new-password', false)).resolves.toBeUndefined();
    expect(repository.changeCredentials).toHaveBeenCalledWith('mario', 'new-password', false);
  });
});
