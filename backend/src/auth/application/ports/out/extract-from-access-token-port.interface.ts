import { Payload } from '../../../domain/payload';
import { ExtractFromAccessTokenCmd } from '../../commands/extract-from-access-token-cmd';

export interface ExtractFromAccessTokenPort {
  extractFromAccessToken(req: ExtractFromAccessTokenCmd): Payload;
}

export const EXTRACT_FROM_ACCESS_TOKEN_PORT = 'EXTRACT_FROM_ACCESS_TOKEN_PORT';
