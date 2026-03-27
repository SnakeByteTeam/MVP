export interface ApiAuthUseCase {
  getLoginUrl(): string;
}

export const APIAUTHUSECASE = Symbol('ApiAuthUseCase');
