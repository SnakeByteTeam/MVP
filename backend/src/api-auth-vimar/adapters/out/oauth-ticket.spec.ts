import { OAuthTicketAdapter } from './oauth-ticket.adapter';
import { WriteOAuthTicketCachePort } from 'src/api-auth-vimar/application/repository/write-oauth-ticket-cache.port';
import { ReadOAuthTicketCachePort } from 'src/api-auth-vimar/application/repository/read-oauth-ticket-cache.port';
import { DeleteOAuthTicketCachePort } from 'src/api-auth-vimar/application/repository/delete-oauth-ticket-cache.port';

describe('OAuthTicketAdapter', () => {
  let adapter: OAuthTicketAdapter;
  let writeOAuthTicketCachePort: jest.Mocked<WriteOAuthTicketCachePort>;
  let readOAuthTicketCachePort: jest.Mocked<ReadOAuthTicketCachePort>;
  let deleteOAuthTicketCachePort: jest.Mocked<DeleteOAuthTicketCachePort>;

  beforeEach(() => {
    writeOAuthTicketCachePort = {
      writeTicket: jest.fn(),
    };

    readOAuthTicketCachePort = {
      readValidTicket: jest.fn(),
    };

    deleteOAuthTicketCachePort = {
      deleteTicket: jest.fn(),
    };

    adapter = new OAuthTicketAdapter(
      writeOAuthTicketCachePort,
      readOAuthTicketCachePort,
      deleteOAuthTicketCachePort,
    );
  });

  it('should delegate saveTicket to cache port', async () => {
    const expiresAt = new Date('2030-01-01T00:00:00.000Z');
    writeOAuthTicketCachePort.writeTicket.mockResolvedValue(true);

    const result = await adapter.saveTicket('ticket-1', 11, expiresAt);

    expect(result).toBe(true);
    expect(writeOAuthTicketCachePort.writeTicket).toHaveBeenCalledTimes(1);
    expect(writeOAuthTicketCachePort.writeTicket).toHaveBeenCalledWith(
      'ticket-1',
      11,
      expiresAt,
    );
  });

  it('should return null when ticket is not found or expired', async () => {
    readOAuthTicketCachePort.readValidTicket.mockResolvedValue(null);

    const result = await adapter.consumeTicket('ticket-1');

    expect(result).toBeNull();
    expect(readOAuthTicketCachePort.readValidTicket).toHaveBeenCalledTimes(1);
    expect(deleteOAuthTicketCachePort.deleteTicket).toHaveBeenCalledTimes(0);
  });

  it('should delete ticket and return associated user id when ticket is valid', async () => {
    readOAuthTicketCachePort.readValidTicket.mockResolvedValue({
      ticket: 'ticket-1',
      userId: 22,
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    deleteOAuthTicketCachePort.deleteTicket.mockResolvedValue(true);

    const result = await adapter.consumeTicket('ticket-1');

    expect(result).toBe(22);
    expect(readOAuthTicketCachePort.readValidTicket).toHaveBeenCalledTimes(1);
    expect(deleteOAuthTicketCachePort.deleteTicket).toHaveBeenCalledTimes(1);
    expect(deleteOAuthTicketCachePort.deleteTicket).toHaveBeenCalledWith(
      'ticket-1',
    );
  });

  it('should throw when ticket deletion fails after a valid read', async () => {
    readOAuthTicketCachePort.readValidTicket.mockResolvedValue({
      ticket: 'ticket-1',
      userId: 22,
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    });
    deleteOAuthTicketCachePort.deleteTicket.mockResolvedValue(false);

    await expect(adapter.consumeTicket('ticket-1')).rejects.toThrow(
      'Unable to consume OAuth ticket',
    );

    expect(readOAuthTicketCachePort.readValidTicket).toHaveBeenCalledTimes(1);
    expect(deleteOAuthTicketCachePort.deleteTicket).toHaveBeenCalledTimes(1);
  });
});
