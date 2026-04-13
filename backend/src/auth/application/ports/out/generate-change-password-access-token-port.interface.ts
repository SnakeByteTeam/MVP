import { GenerateChangePasswordAccessTokenCmd } from '../../commands/generate-change-password-access-token-cmd';

export interface GenerateChangePasswordAccessTokenPort {
  generateChangePasswordAccessToken(
    req: GenerateChangePasswordAccessTokenCmd,
  ): string;
}

export const GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT = 'GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT';
