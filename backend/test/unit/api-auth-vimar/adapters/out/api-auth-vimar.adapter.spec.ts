import { Test, TestingModule } from '@nestjs/testing';
import { ApiAuthVimarAdapter } from 'src/api-auth-vimar/adapters/out/api-auth-vimar.adapter';
import {
  DELETETOKENSCACHEPORT,
  type DeleteTokensCachePort,
} from 'src/api-auth-vimar/application/repository/delete-tokens-cache.port';
import {
  GETTOKENSFROMAPIPORT,
  type GetTokensFromApiPort,
} from 'src/api-auth-vimar/application/repository/get-tokens-from-api.port';
import {
  READOAUTHTICKETCACHEPORT,
  type ReadOAuthTicketCachePort,
} from 'src/api-auth-vimar/application/repository/read-oauth-ticket-cache.port';
import {
  WRITEOAUTHTICKETCACHEPORT,
  type WriteOAuthTicketCachePort,
} from 'src/api-auth-vimar/application/repository/write-oauth-ticket-cache.port';
import {
  DELETEOAUTHTICKETCACHEPORT,
  type DeleteOAuthTicketCachePort,
} from 'src/api-auth-vimar/application/repository/delete-oauth-ticket-cache.port';
import {
  READTOKENSCACHEPORT,
  type ReadTokensCachePort,
} from 'src/api-auth-vimar/application/repository/read-tokens-cache.port';
import {
  REFRESHTOKENSFROMAPIPORT,
  type RefreshTokensFromApiPort,
} from 'src/api-auth-vimar/application/repository/refresh-tokens-from-api.port';
import {
  WRITETOKENSCACHEPORT,
  type WriteTokensCachePort,
} from 'src/api-auth-vimar/application/repository/write-tokens-cache.port';
import {
  READ_STATUS_REPO_PORT,
  type ReadStatusRepoPort,
} from 'src/api-auth-vimar/application/repository/read-status.repository';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';
import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';
import { TokenEntity } from 'src/api-auth-vimar/infrastructure/persistence/entities/tokens.entity';

describe('ApiAuthVimarAdapter', () => {
  let adapter: ApiAuthVimarAdapter;
  let deleteTokensPort: jest.Mocked<DeleteTokensCachePort>;
  let getTokensFromApiPort: jest.Mocked<GetTokensFromApiPort>;
  let readOAuthTicketPort: jest.Mocked<ReadOAuthTicketCachePort>;
  let writeOAuthTicketPort: jest.Mocked<WriteOAuthTicketCachePort>;
  let deleteOAuthTicketPort: jest.Mocked<DeleteOAuthTicketCachePort>;
  let readTokensPort: jest.Mocked<ReadTokensCachePort>;
  let refreshTokensPort: jest.Mocked<RefreshTokensFromApiPort>;
  let writeTokensPort: jest.Mocked<WriteTokensCachePort>;
  let readStatusPort: jest.Mocked<ReadStatusRepoPort>;

  beforeEach(async () => {
    deleteTokensPort = { deleteTokens: jest.fn() };
    getTokensFromApiPort = { getTokensWithCode: jest.fn() };
    readOAuthTicketPort = { readValidTicket: jest.fn() };
    writeOAuthTicketPort = { writeTicket: jest.fn() };
    deleteOAuthTicketPort = { deleteTicket: jest.fn() };
    readTokensPort = { readTokens: jest.fn() };
    refreshTokensPort = { refresh: jest.fn() };
    writeTokensPort = { writeTokens: jest.fn() };
    readStatusPort = { readStatus: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiAuthVimarAdapter,
        { provide: DELETETOKENSCACHEPORT, useValue: deleteTokensPort },
        { provide: GETTOKENSFROMAPIPORT, useValue: getTokensFromApiPort },
        { provide: READOAUTHTICKETCACHEPORT, useValue: readOAuthTicketPort },
        { provide: WRITEOAUTHTICKETCACHEPORT, useValue: writeOAuthTicketPort },
        { provide: DELETEOAUTHTICKETCACHEPORT, useValue: deleteOAuthTicketPort },
        { provide: READTOKENSCACHEPORT, useValue: readTokensPort },
        { provide: REFRESHTOKENSFROMAPIPORT, useValue: refreshTokensPort },
        { provide: WRITETOKENSCACHEPORT, useValue: writeTokensPort },
        { provide: READ_STATUS_REPO_PORT, useValue: readStatusPort },
      ],
    }).compile();

    adapter = module.get<ApiAuthVimarAdapter>(ApiAuthVimarAdapter);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('deleteTokens', () => {
    it('should delete tokens successfully', async () => {
      deleteTokensPort.deleteTokens.mockResolvedValue(true);

      const result = await adapter.deleteTokens();

      expect(result).toBe(true);
      expect(deleteTokensPort.deleteTokens).toHaveBeenCalledTimes(1);
    });

    it('should handle delete failure', async () => {
      deleteTokensPort.deleteTokens.mockResolvedValue(false);

      const result = await adapter.deleteTokens();

      expect(result).toBe(false);
    });
  });

  describe('getTokensWithCode', () => {
    it('should get tokens with code successfully', async () => {
      const mockDto: TokensDto = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        email: 'user@example.com',
      } as TokensDto;

      getTokensFromApiPort.getTokensWithCode.mockResolvedValue(mockDto);

      const result = await adapter.getTokensWithCode('auth-code');

      expect(result.email).toBe('user@example.com');
      expect(result.tokenPair).toBeDefined();
      expect(getTokensFromApiPort.getTokensWithCode).toHaveBeenCalledWith(
        'auth-code',
      );
    });

    it('should throw error when no tokens found', async () => {
      getTokensFromApiPort.getTokensWithCode.mockResolvedValue(null);

      await expect(adapter.getTokensWithCode('auth-code')).rejects.toThrow(
        'Tokens not found',
      );
    });
  });

  describe('OAuth ticket operations', () => {
    it('should save ticket successfully', async () => {
      const expiresAt = new Date();
      writeOAuthTicketPort.writeTicket.mockResolvedValue(true);

      const result = await adapter.saveTicket('ticket-123', 1, expiresAt);

      expect(result).toBe(true);
      expect(writeOAuthTicketPort.writeTicket).toHaveBeenCalledWith(
        'ticket-123',
        1,
        expiresAt,
      );
    });

    it('should consume ticket successfully', async () => {
      readOAuthTicketPort.readValidTicket.mockResolvedValue({
        ticket: 'ticket-123',
        userId: 1,
        expiresAt: new Date(),
      });
      deleteOAuthTicketPort.deleteTicket.mockResolvedValue(true);

      const result = await adapter.consumeTicket('ticket-123');

      expect(result).toBe(1);
      expect(readOAuthTicketPort.readValidTicket).toHaveBeenCalledWith(
        'ticket-123',
      );
      expect(deleteOAuthTicketPort.deleteTicket).toHaveBeenCalledWith(
        'ticket-123',
      );
    });

    it('should return null when ticket not found', async () => {
      readOAuthTicketPort.readValidTicket.mockResolvedValue(null);

      const result = await adapter.consumeTicket('ticket-123');

      expect(result).toBeNull();
      expect(deleteOAuthTicketPort.deleteTicket).not.toHaveBeenCalled();
    });

    it('should throw error when delete ticket fails', async () => {
      readOAuthTicketPort.readValidTicket.mockResolvedValue({
        ticket: 'ticket-123',
        userId: 1,
        expiresAt: new Date(),
      });
      deleteOAuthTicketPort.deleteTicket.mockResolvedValue(false);

      await expect(adapter.consumeTicket('ticket-123')).rejects.toThrow(
        'Unable to consume OAuth ticket',
      );
    });
  });

  describe('readStatus', () => {
    it('should read status as linked', async () => {
      readStatusPort.readStatus.mockResolvedValue('user@example.com');

      const result = await adapter.readStatus(1);

      expect(result.isLinked).toBe(true);
      expect(result.email).toBe('user@example.com');
      expect(readStatusPort.readStatus).toHaveBeenCalledWith(1);
    });

    it('should read status as not linked', async () => {
      readStatusPort.readStatus.mockResolvedValue(null);

      const result = await adapter.readStatus(1);

      expect(result.isLinked).toBe(false);
      expect(result.email).toBe('');
    });
  });

  describe('readTokens', () => {
    it('should read tokens successfully', async () => {
      const mockEntity: TokenEntity = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
      } as TokenEntity;

      readTokensPort.readTokens.mockResolvedValue(mockEntity);

      const result = await adapter.readTokens();

      expect(result).toBeInstanceOf(TokenPair);
      expect(readTokensPort.readTokens).toHaveBeenCalledTimes(1);
    });

    it('should throw error when no tokens found', async () => {
      readTokensPort.readTokens.mockResolvedValue(null);

      await expect(adapter.readTokens()).rejects.toThrow(
        'No tokens found in cache',
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockDto: TokensDto = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      } as TokensDto;

      refreshTokensPort.refresh.mockResolvedValue(mockDto);

      const result = await adapter.refreshTokens('refresh-token');

      expect(result).toBeInstanceOf(TokenPair);
      expect(refreshTokensPort.refresh).toHaveBeenCalledWith('refresh-token');
    });

    it('should throw error when refresh fails', async () => {
      refreshTokensPort.refresh.mockResolvedValue(null);

      await expect(adapter.refreshTokens('refresh-token')).rejects.toThrow(
        'Problem requesting tokens to API',
      );
    });
  });

  describe('writeTokens', () => {
    it('should write tokens with provided credentials', async () => {
      const mockPair = new TokenPair(
        'access-token',
        'refresh-token',
        new Date(Date.now() + 3600000),
      );

      writeTokensPort.writeTokens.mockResolvedValue(true);

      const result = await adapter.writeTokens(mockPair, 1, 'user@example.com');

      expect(result).toBe(true);
      expect(writeTokensPort.writeTokens).toHaveBeenCalledWith(
        'access-token',
        'refresh-token',
        expect.any(Date),
        1,
        'user@example.com',
      );
    });

    it('should throw error when missing metadata and cache is empty', async () => {
      const mockPair = new TokenPair(
        'access-token',
        'refresh-token',
        new Date(Date.now() + 3600000),
      );

      readTokensPort.readTokens.mockResolvedValue(null);

      await expect(adapter.writeTokens(mockPair)).rejects.toThrow(
        'Missing user metadata to persist refreshed tokens',
      );
    });

    it('should fetch metadata from cache when not provided', async () => {
      const mockPair = new TokenPair(
        'access-token',
        'refresh-token',
        new Date(Date.now() + 3600000),
      );

      const cachedTokens: TokenEntity = {
        accessToken: 'old',
        refreshToken: 'old',
        userId: 2,
        email: 'cached@example.com',
      } as TokenEntity;

      readTokensPort.readTokens.mockResolvedValue(cachedTokens);
      writeTokensPort.writeTokens.mockResolvedValue(true);

      const result = await adapter.writeTokens(mockPair);

      expect(result).toBe(true);
      expect(writeTokensPort.writeTokens).toHaveBeenCalledWith(
        'access-token',
        'refresh-token',
        expect.any(Date),
        2,
        'cached@example.com',
      );
    });
  });
});
