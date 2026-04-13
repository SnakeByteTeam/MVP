import { GenerateAccessTokenCmd } from '../../commands/generate-access-token-cmd';

export interface GenerateAccessTokenPort {
  generateAccessToken(req: GenerateAccessTokenCmd): string;
}

export const GENERATE_ACCESS_TOKEN_PORT = 'GENERATE_ACCESS_TOKEN_PORT';
