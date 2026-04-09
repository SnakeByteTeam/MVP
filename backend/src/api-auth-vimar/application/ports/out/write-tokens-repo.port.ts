import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

export interface WriteTokensRepoPort {
  writeTokens(
    tokens: TokenPair,
    userId?: number,
    email?: string,
  ): Promise<boolean>;
}

export const WRITETOKENSREPOPORT = Symbol('WriteTokensRepoPort');
