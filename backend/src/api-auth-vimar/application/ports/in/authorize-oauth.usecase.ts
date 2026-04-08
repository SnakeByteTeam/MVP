export interface AuthorizeOAuthUseCase {
  authorizeOAuth(ticket: string): Promise<number | null>;
}

export const AUTHORIZEOAUTHUSECASE = 'AUTHORIZEOAUTHUSECASE';
