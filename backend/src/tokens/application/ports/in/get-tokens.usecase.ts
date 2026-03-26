export interface GetTokensCallbackUseCase {
  getTokens(code: string);
}

export const GETTOKENSCALLBACKUSECASE = Symbol('GetTokensCallbackUseCase');
