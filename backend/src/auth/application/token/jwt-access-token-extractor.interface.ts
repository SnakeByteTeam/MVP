import { Payload } from '../../domain/payload';

export interface JwtAccessTokenExtractor {
  extractAccessTokenPayload(token: string): Payload;
}
