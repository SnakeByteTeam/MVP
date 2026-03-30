import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

export interface ReadTokensFromRepoPort {
  readTokens(): Promise<TokenPair>;
}

export const READTOKENSFROMREPOPORT = Symbol('ReadTokensFromRepoPort');
