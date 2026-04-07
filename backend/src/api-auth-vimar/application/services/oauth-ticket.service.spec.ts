import { OAuthTicketService } from './oauth-ticket.service';
import { OAuthTicketPort } from '../ports/out/oauth-ticket.port';

describe('OAuthTicketService', () => {
  let service: OAuthTicketService;
  let oauthTicketPort: jest.Mocked<OAuthTicketPort>;

  beforeEach(() => {
    oauthTicketPort = {
      saveTicket: jest.fn(),
      consumeTicket: jest.fn(),
    };

    service = new OAuthTicketService(oauthTicketPort);
  });

  it('should generate UUID ticket and persist it with 60 seconds TTL', async () => {
    oauthTicketPort.saveTicket.mockResolvedValue(true);

    const start = Date.now();
    const ticket = await service.prepareOAuth(7);
    const end = Date.now();

    expect(ticket).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    expect(oauthTicketPort.saveTicket).toHaveBeenCalledTimes(1);

    const [savedTicket, savedUserId, expiresAt] =
      oauthTicketPort.saveTicket.mock.calls[0];

    expect(savedTicket).toBe(ticket);
    expect(savedUserId).toBe(7);
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(start + 59_000);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(end + 61_000);
  });

  it('should throw when user id is not valid', async () => {
    await expect(service.prepareOAuth(0)).rejects.toThrow('Invalid user identity');

    expect(oauthTicketPort.saveTicket).toHaveBeenCalledTimes(0);
  });

  it('should throw when ticket persistence fails', async () => {
    oauthTicketPort.saveTicket.mockResolvedValue(false);

    await expect(service.prepareOAuth(1)).rejects.toThrow(
      'Unable to persist OAuth ticket',
    );

    expect(oauthTicketPort.saveTicket).toHaveBeenCalledTimes(1);
  });

  it('should return null when ticket is empty', async () => {
    const result = await service.authorizeOAuth('  ');

    expect(result).toBeNull();
    expect(oauthTicketPort.consumeTicket).toHaveBeenCalledTimes(0);
  });

  it('should consume ticket and return associated user id', async () => {
    oauthTicketPort.consumeTicket.mockResolvedValue(9);

    const result = await service.authorizeOAuth('  ticket-123  ');

    expect(result).toBe(9);
    expect(oauthTicketPort.consumeTicket).toHaveBeenCalledTimes(1);
    expect(oauthTicketPort.consumeTicket).toHaveBeenCalledWith('ticket-123');
  });
});
