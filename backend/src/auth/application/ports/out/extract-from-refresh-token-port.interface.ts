import { Payload } from '../../../domain/payload';
import { ExtractFromRefreshTokenCmd } from '../../commands/extract-from-refresh-token-cmd';

export interface ExtractFromRefreshTokenPort {
  extractFromRefreshToken(req: ExtractFromRefreshTokenCmd): Payload;
}

export const EXTRACT_FROM_REFRESH_TOKEN_PORT = 'EXTRACT_FROM_REFRESH_TOKEN_PORT';
