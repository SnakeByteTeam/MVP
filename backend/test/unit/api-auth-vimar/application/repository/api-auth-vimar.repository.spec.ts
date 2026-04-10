import {
  API_AUTH_VIMAR_REPOSITORY_PORT,
  ApiAuthVimarRepositoryPort,
  ReadOAuthTicketCacheEntity,
} from 'src/api-auth-vimar/application/repository/api-auth-vimar.repository';

describe('ApiAuthVimarRepositoryPort token', () => {
  it('espone il Symbol DI atteso', () => {
    expect(typeof API_AUTH_VIMAR_REPOSITORY_PORT).toBe('symbol');
    expect(String(API_AUTH_VIMAR_REPOSITORY_PORT)).toContain('ApiAuthVimarRepositoryPort');
  });

  it('copre il contratto base della porta repository', async () => {
    const ticketEntity: ReadOAuthTicketCacheEntity = {
      ticket: 'ticket-1',
      userId: 11,
      expiresAt: new Date('2026-04-10T10:00:00.000Z'),
    };

    const repository: ApiAuthVimarRepositoryPort = {
      deleteTokens: jest.fn().mockResolvedValue(true),
      readTokens: jest.fn().mockResolvedValue(null),
      writeTokens: jest.fn().mockResolvedValue(true),
      getTokensWithCode: jest.fn().mockResolvedValue(null),
      refresh: jest.fn().mockResolvedValue(null),
      writeTicket: jest.fn().mockResolvedValue(true),
      readValidTicket: jest.fn().mockResolvedValue(ticketEntity),
      deleteTicket: jest.fn().mockResolvedValue(true),
      readStatus: jest.fn().mockResolvedValue('OK'),
    };

    await expect(repository.deleteTokens()).resolves.toBe(true);
    await expect(repository.readValidTicket('ticket-1')).resolves.toEqual(ticketEntity);
    await expect(repository.readStatus(11)).resolves.toBe('OK');
  });
});
