import { TokenPair } from 'src/tokens/domain/models/token-pair.model';

export interface WriteTokensRepoPort {
  writeTokens(tokens: TokenPair): Promise<boolean>;
}

export const WRITETOKENSREPOPORT = Symbol('WriteTokensRepoPort');
