import { TokenEntity } from 'src/api-auth-vimar/infrastructure/persistence/entities/tokens.entity';

export interface ReadTokensCachePort {
  readTokens(): Promise<TokenEntity | null>;
}

export const READTOKENSCACHEPORT = Symbol('ReadTokensCachePort');
