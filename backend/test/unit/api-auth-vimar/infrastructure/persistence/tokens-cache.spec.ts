import { TokenCacheImpl } from 'src/api-auth-vimar/infrastructure/persistence/tokens-cache.impl';
import { Pool } from 'pg';

describe('TokenCacheImpl', () => {
  let cacheImpl: TokenCacheImpl;
  let pool: jest.Mocked<Pick<Pool, 'connect'>>;
  let queryMock: jest.Mock;
  let releaseMock: jest.Mock;

  beforeEach(() => {
    queryMock = jest.fn();
    releaseMock = jest.fn();

    pool = {
      connect: jest.fn().mockResolvedValue({
        query: queryMock,
        release: releaseMock,
      }),
    };

    cacheImpl = new TokenCacheImpl(pool as unknown as Pool);
  });

  it('should write tokens in cache and return true when query succeeds', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    const result = await cacheImpl.writeTokens(
      'access-1',
      'refresh-1',
      expiresAt,
      42,
      'utente@example.com',
    );

    expect(result).toBe(true);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO token_cache'),
      ['access-1', 'refresh-1', expiresAt, 42, 'utente@example.com'],
    );
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return false when query throws an error', async () => {
    queryMock.mockRejectedValue(new Error('db error'));

    const result = await cacheImpl.writeTokens(
      'access-1',
      'refresh-1',
      new Date('2030-01-01T00:00:00.000Z'),
      42,
      'utente@example.com',
    );

    expect(result).toBe(false);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should log unknown error details when writeTokens fails with non-Error value', async () => {
    const loggerErrorSpy = jest
      .spyOn((cacheImpl as any).logger, 'error')
      .mockImplementation();
    queryMock.mockRejectedValue('raw db failure');

    const result = await cacheImpl.writeTokens(
      'access-1',
      'refresh-1',
      new Date('2030-01-01T00:00:00.000Z'),
      42,
      'utente@example.com',
    );

    expect(result).toBe(false);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Failed writing token_cache row: Unknown error',
      undefined,
    );
  });

  it('should read tokens from cache and map row fields to token entity', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    queryMock.mockResolvedValue({
      rows: [
        {
          access_token: 'access-1',
          refresh_token: 'refresh-1',
          expires_at: expiresAt,
          user_id: 42,
          email: 'utente@example.com',
        },
      ],
    });

    const result = await cacheImpl.readTokens();

    expect(result).toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      expiresAt,
      userId: 42,
      email: 'utente@example.com',
    });
    expect(queryMock).toHaveBeenCalledWith('SELECT * FROM token_cache');
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return null when cache has no tokens', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const result = await cacheImpl.readTokens();

    expect(result).toBeNull();
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should rethrow when read query fails', async () => {
    queryMock.mockRejectedValue(new Error('db read error'));

    await expect(cacheImpl.readTokens()).rejects.toThrow('db read error');
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should delete tokens and return true when query succeeds', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const result = await cacheImpl.deleteTokens();

    expect(result).toBe(true);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith('DELETE FROM token_cache');
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return false when delete query throws', async () => {
    queryMock.mockRejectedValue(new Error('db delete error'));

    const result = await cacheImpl.deleteTokens();

    expect(result).toBe(false);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  describe('readStatus', () => {
    it('should return email when user has linked tokens', async () => {
      queryMock.mockResolvedValue({ rows: [{ email: 'utente@example.com' }] });

      const result = await cacheImpl.readStatus(42);

      expect(result).toBe('utente@example.com');
      expect(queryMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT email FROM token_cache WHERE user_id = $1'),
        [42],
      );
      expect(releaseMock).toHaveBeenCalled();
    });

    it('should return null when no status row is found', async () => {
      queryMock.mockResolvedValue({ rows: [] });

      const result = await cacheImpl.readStatus(42);

      expect(result).toBeNull();
      expect(releaseMock).toHaveBeenCalled();
    });

    it('should return null when email value is empty', async () => {
      queryMock.mockResolvedValue({ rows: [{ email: '' }] });

      const result = await cacheImpl.readStatus(42);

      expect(result).toBeNull();
      expect(releaseMock).toHaveBeenCalled();
    });
  });
});
