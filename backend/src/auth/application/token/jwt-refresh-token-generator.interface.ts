import { Payload } from '../../domain/payload';

export interface JwtRefreshTokenGenerator {
  generateRefreshToken(payload: Payload): string;
}
