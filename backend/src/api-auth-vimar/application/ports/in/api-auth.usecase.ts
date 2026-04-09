export interface ApiAuthUseCase {
  getLoginUrl(state?: string): string;
}

export const APIAUTHUSECASE = Symbol('ApiAuthUseCase');
