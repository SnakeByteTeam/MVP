import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

export interface RefreshTokensPort {
  refreshTokens(refreshToken: string): Promise<TokenPair | null>;
}

export const REFRESHTOKENSPORT = Symbol('RefreshTokensPort');
