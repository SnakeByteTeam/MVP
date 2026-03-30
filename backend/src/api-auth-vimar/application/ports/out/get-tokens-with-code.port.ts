import { TokenPair } from 'src/api-auth-vimar/domain/model/token-pair.model';

export interface GetTokensWithCodePort {
  getTokensWithCode(code: string): Promise<TokenPair>;
}

export const GETTOKENSWITHCODEPORT = Symbol('GetTokensWithCodePort');
