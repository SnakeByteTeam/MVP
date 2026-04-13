import { GenerateRefreshTokenCmd } from '../../commands/generate-refresh-token-cmd';

export interface GenerateRefreshTokenPort {
  generateRefreshToken(req: GenerateRefreshTokenCmd): string;
}

export const GENERATE_REFRESH_TOKEN_PORT = 'GENERATE_REFRESH_TOKEN_PORT';
