import { TokenCacheImpl } from './tokens-cache.impl';
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
    );

    expect(result).toBe(true);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO token_cache'),
      ['access-1', 'refresh-1', expiresAt],
    );
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return false when query throws an error', async () => {
    queryMock.mockRejectedValue(new Error('db error'));

    const result = await cacheImpl.writeTokens(
      'access-1',
      'refresh-1',
      new Date('2030-01-01T00:00:00.000Z'),
    );

    expect(result).toBe(false);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should read tokens from cache and map row fields to token entity', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    queryMock.mockResolvedValue({
      rows: [
        {
          access_token: 'access-1',
          refresh_token: 'refresh-1',
          expires_at: expiresAt,
        },
      ],
    });

    const result = await cacheImpl.readTokens();

    expect(result).toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      expiresAt,
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
});
