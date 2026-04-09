export interface GetTokensCallbackUseCase {
  getTokens(code: string, userId: number);
}

export const GETTOKENSCALLBACKUSECASE = Symbol('GetTokensCallbackUseCase');
