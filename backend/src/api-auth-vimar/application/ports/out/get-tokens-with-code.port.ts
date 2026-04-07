import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

export interface GetTokensWithCodePort {
  getTokensWithCode(code: string): Promise<{ tokenPair: TokenPair, email: string }>;
}

export const GETTOKENSWITHCODEPORT = Symbol('GetTokensWithCodePort');
