export interface PrepareOAuthUseCase {
  prepareOAuth(userId: number): Promise<string>;
}

export const PREPAREOAUTHUSECASE = 'PREPAREOAUTHUSECASE';