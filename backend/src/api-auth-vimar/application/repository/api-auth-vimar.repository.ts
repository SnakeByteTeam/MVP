import { TokensDto } from 'src/api-auth-vimar/infrastructure/dto/tokens.dto';
import { TokenEntity } from 'src/api-auth-vimar/infrastructure/persistence/entities/tokens.entity';

export interface ReadOAuthTicketCacheEntity {
  ticket: string;
  userId: number;
  expiresAt: Date;
}

export interface ApiAuthVimarRepositoryPort {
  // Token cache operations
  deleteTokens(): Promise<boolean>;
  readTokens(): Promise<TokenEntity | null>;
  writeTokens(
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    userId: number,
    email: string,
  ): Promise<boolean>;

  // API token operations
  getTokensWithCode(code: string): Promise<TokensDto | null>;
  refresh(refreshToken: string): Promise<TokensDto | null>;

  // OAuth ticket operations
  writeTicket(
    ticket: string,
    userId: number,
    expiresAt: Date,
  ): Promise<boolean>;
  readValidTicket(ticket: string): Promise<ReadOAuthTicketCacheEntity | null>;
  deleteTicket(ticket: string): Promise<boolean>;

  // Status operations
  readStatus(userId: number): Promise<string | null>;
}

export const API_AUTH_VIMAR_REPOSITORY_PORT = Symbol(
  'ApiAuthVimarRepositoryPort',
);
