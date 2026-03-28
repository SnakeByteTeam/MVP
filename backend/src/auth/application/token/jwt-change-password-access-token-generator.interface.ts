import { Payload } from '../../domain/payload';

export interface JwtChangePasswordAccessTokenGenerator {
  generateChangePasswordAccessToken(payload: Payload): string;
}
