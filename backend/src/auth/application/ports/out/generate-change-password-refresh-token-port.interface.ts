import { GenerateChangePasswordRefreshTokenCmd } from '../../commands/generate-change-password-refresh-token-cmd';

export interface GenerateChangePasswordRefreshTokenPort {
  generateChangePasswordRefreshToken(
    req: GenerateChangePasswordRefreshTokenCmd,
  ): string;
}

export const GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT = 'GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT';
