import { Pool } from 'pg';
import { OAuthTicketCacheImpl } from './oauth-ticket-cache.impl';

describe('OAuthTicketCacheImpl', () => {
  let cacheImpl: OAuthTicketCacheImpl;
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

    cacheImpl = new OAuthTicketCacheImpl(pool as unknown as Pool);
  });

  it('should write ticket in cache and return true when query succeeds', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    const result = await cacheImpl.writeTicket('ticket-1', 4, expiresAt);

    expect(result).toBe(true);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO oauth_ticket_cache'),
      ['ticket-1', 4, expiresAt],
    );
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return false when write query throws an error', async () => {
    queryMock.mockRejectedValue(new Error('db write error'));

    const result = await cacheImpl.writeTicket(
      'ticket-1',
      4,
      new Date('2030-01-01T00:00:00.000Z'),
    );

    expect(result).toBe(false);
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should read valid ticket and map row fields to entity', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    queryMock.mockResolvedValue({
      rows: [
        {
          ticket: 'ticket-1',
          user_id: 7,
          expires_at: expiresAt,
        },
      ],
    });

    const result = await cacheImpl.readValidTicket('ticket-1');

    expect(result).toEqual({
      ticket: 'ticket-1',
      userId: 7,
      expiresAt,
    });
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('FROM oauth_ticket_cache'),
      ['ticket-1'],
    );
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return null when ticket is missing or expired', async () => {
    queryMock.mockResolvedValue({ rows: [] });

    const result = await cacheImpl.readValidTicket('ticket-1');

    expect(result).toBeNull();
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should rethrow when read query fails', async () => {
    queryMock.mockRejectedValue(new Error('db read error'));

    await expect(cacheImpl.readValidTicket('ticket-1')).rejects.toThrow(
      'db read error',
    );
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should delete ticket and return true when row is deleted', async () => {
    queryMock.mockResolvedValue({ rowCount: 1 });

    const result = await cacheImpl.deleteTicket('ticket-1');

    expect(result).toBe(true);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM oauth_ticket_cache'),
      ['ticket-1'],
    );
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return false when no rows are deleted', async () => {
    queryMock.mockResolvedValue({ rowCount: 0 });

    const result = await cacheImpl.deleteTicket('ticket-1');

    expect(result).toBe(false);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return false when delete rowCount is undefined', async () => {
    queryMock.mockResolvedValue({});

    const result = await cacheImpl.deleteTicket('ticket-1');

    expect(result).toBe(false);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });

  it('should return false when delete query throws', async () => {
    queryMock.mockRejectedValue(new Error('db delete error'));

    const result = await cacheImpl.deleteTicket('ticket-1');

    expect(result).toBe(false);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(releaseMock).toHaveBeenCalledTimes(1);
  });
});
