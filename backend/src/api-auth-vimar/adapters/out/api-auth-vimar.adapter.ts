import { Inject, Injectable } from '@nestjs/common';
import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';
import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';

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

import {
  DeleteTokensFromRepoPort,
  DELETETOKENSFROMREPOPORT,
} from 'src/api-auth-vimar/application/ports/out/delete-tokens-from-repo.port';
import {
  GetTokensWithCodePort,
  GETTOKENSWITHCODEPORT,
} from 'src/api-auth-vimar/application/ports/out/get-tokens-with-code.port';
import {
  OAuthTicketPort,
  OAUTHTICKETPORT,
} from 'src/api-auth-vimar/application/ports/out/oauth-ticket.port';
import {
  ReadStatusPort,
  READ_STATUS_PORT,
} from 'src/api-auth-vimar/application/ports/out/read-status.port';
import {
  ReadTokensFromRepoPort,
  READTOKENSFROMREPOPORT,
} from 'src/api-auth-vimar/application/ports/out/read-tokens-from-repo.port';
import {
  RefreshTokensPort,
  REFRESHTOKENSPORT,
} from 'src/api-auth-vimar/application/ports/out/refresh-tokens.port';
import {
  WriteTokensRepoPort,
  WRITETOKENSREPOPORT,
} from 'src/api-auth-vimar/application/ports/out/write-tokens-repo.port';
import { TokenEntity } from 'src/api-auth-vimar/infrastructure/persistence/entities/tokens.entity';

@Injectable()
export class ApiAuthVimarAdapter
  implements
    DeleteTokensFromRepoPort,
    GetTokensWithCodePort,
    OAuthTicketPort,
    ReadStatusPort,
    ReadTokensFromRepoPort,
    RefreshTokensPort,
    WriteTokensRepoPort
{
  constructor(
    @Inject(DELETETOKENSCACHEPORT)
    private readonly deleteTokensCachePort: DeleteTokensCachePort,
    @Inject(GETTOKENSFROMAPIPORT)
    private readonly getTokensFromApiPort: GetTokensFromApiPort,
    @Inject(READOAUTHTICKETCACHEPORT)
    private readonly readOAuthTicketCachePort: ReadOAuthTicketCachePort,
    @Inject(WRITEOAUTHTICKETCACHEPORT)
    private readonly writeOAuthTicketCachePort: WriteOAuthTicketCachePort,
    @Inject(DELETEOAUTHTICKETCACHEPORT)
    private readonly deleteOAuthTicketCachePort: DeleteOAuthTicketCachePort,
    @Inject(READTOKENSCACHEPORT)
    private readonly readTokensCachePort: ReadTokensCachePort,
    @Inject(REFRESHTOKENSFROMAPIPORT)
    private readonly refreshTokensFromApi: RefreshTokensFromApiPort,
    @Inject(WRITETOKENSCACHEPORT)
    private readonly writeTokensCachePort: WriteTokensCachePort,
    @Inject(READ_STATUS_REPO_PORT)
    private readonly readStatusRepo: ReadStatusRepoPort,
  ) {}

  // Delete tokens
  async deleteTokens(): Promise<boolean> {
    return this.deleteTokensCachePort.deleteTokens();
  }

  // Get tokens with code
  async getTokensWithCode(
    code: string,
  ): Promise<{ tokenPair: TokenPair; email: string }> {
    const tokensDto: TokensDto | null =
      await this.getTokensFromApiPort.getTokensWithCode(code);

    if (!tokensDto) throw new Error('Tokens not found');

    const expiresAt: Date = new Date(Date.now() + tokensDto.expiresIn * 1000);

    const tokenPair: TokenPair = new TokenPair(
      tokensDto.accessToken,
      tokensDto.refreshToken,
      expiresAt,
    );

    return { tokenPair: tokenPair, email: tokensDto.email };
  }

  // OAuth ticket
  async saveTicket(
    ticket: string,
    userId: number,
    expiresAt: Date,
  ): Promise<boolean> {
    return this.writeOAuthTicketCachePort.writeTicket(
      ticket,
      userId,
      expiresAt,
    );
  }

  async consumeTicket(ticket: string): Promise<number | null> {
    const persistedTicket =
      await this.readOAuthTicketCachePort.readValidTicket(ticket);

    if (!persistedTicket) {
      return null;
    }

    const deleted = await this.deleteOAuthTicketCachePort.deleteTicket(ticket);
    if (!deleted) {
      throw new Error('Unable to consume OAuth ticket');
    }

    return persistedTicket.userId;
  }

  // Read status
  async readStatus(
    userId: number,
  ): Promise<{ isLinked: boolean; email: string }> {
    const email = await this.readStatusRepo.readStatus(userId);
    return {
      isLinked: !!email,
      email: email || '',
    };
  }

  // Read tokens
  async readTokens(): Promise<TokenPair> {
    const tokens: TokenEntity | null =
      await this.readTokensCachePort.readTokens();

    if (!tokens) {
      throw new Error('No tokens found in cache');
    }

    return new TokenPair(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.expiresAt,
    );
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string): Promise<TokenPair | null> {
    const tokens: TokensDto | null =
      await this.refreshTokensFromApi.refresh(refreshToken);

    if (!tokens) throw new Error('Problem requesting tokens to API');

    const expiresAt: Date = new Date(Date.now() + tokens.expiresIn * 1000);

    return new TokenPair(tokens.accessToken, tokens.refreshToken, expiresAt);
  }

  // Write tokens
  async writeTokens(
    tokens: TokenPair,
    userId?: number,
    email?: string,
  ): Promise<boolean> {
    const accessToken = tokens.getAccessToken();
    const refreshToken = tokens.getRefreshToken();
    const expiresAt = tokens.getExpiresAt();

    let resolvedUserId = userId;
    let resolvedEmail = email;

    if (resolvedUserId === undefined || resolvedEmail === undefined) {
      const cachedTokens = await this.readTokensCachePort.readTokens();
      if (!cachedTokens) {
        throw new Error('Missing user metadata to persist refreshed tokens');
      }

      resolvedUserId ??= cachedTokens.userId;
      resolvedEmail ??= cachedTokens.email;
    }

    return await this.writeTokensCachePort.writeTokens(
      accessToken,
      refreshToken,
      expiresAt,
      resolvedUserId,
      resolvedEmail,
    );
  }
}

// Register all output port symbols from the adapter
export const API_AUTH_VIMAR_ADAPTER_PROVIDERS = [
  { provide: DELETETOKENSFROMREPOPORT, useClass: ApiAuthVimarAdapter },
  { provide: GETTOKENSWITHCODEPORT, useClass: ApiAuthVimarAdapter },
  { provide: OAUTHTICKETPORT, useClass: ApiAuthVimarAdapter },
  { provide: READ_STATUS_PORT, useClass: ApiAuthVimarAdapter },
  { provide: READTOKENSFROMREPOPORT, useClass: ApiAuthVimarAdapter },
  { provide: REFRESHTOKENSPORT, useClass: ApiAuthVimarAdapter },
  { provide: WRITETOKENSREPOPORT, useClass: ApiAuthVimarAdapter },
];
