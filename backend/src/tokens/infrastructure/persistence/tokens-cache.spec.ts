import { TokenCacheImpl } from './tokens-cache.impl';
import { Pool } from 'pg';

describe('TokenCacheImpl', () => {
  let cacheImpl: TokenCacheImpl;
  let pool: jest.Mocked<Pick<Pool, 'connect'>>;
  let queryMock: jest.Mock;

  beforeEach(() => {
    queryMock = jest.fn();

    pool = {
      connect: jest.fn().mockResolvedValue({
        query: queryMock,
      }),
    };

    cacheImpl = new TokenCacheImpl(pool as unknown as Pool);
  });

  it('should write tokens in cache and return true when query succeeds', async () => {
    queryMock.mockResolvedValue({ rows: [] });
    
    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    const result = await cacheImpl.writeTokens('access-1', 'refresh-1', expiresAt);

    expect(result).toBe(true);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO TOKEN_CACHE'),
      ['access-1', 'refresh-1', expiresAt],
    );
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
  });
});