import { Inject } from '@nestjs/common';
import { GenerateRefreshTokenCmd } from '../../application/commands/generate-refresh-token-cmd';
import { GenerateRefreshTokenPort } from '../../application/ports/out/generate-refresh-token-port.interface';
import { JwtRefreshTokenGenerator } from '../../application/token/jwt-refresh-token-generator.interface';
import { JWT_REFRESH_TOKEN_GENERATOR } from '../../infrastructure/jwt-token-generator/jwt-token-generator';

export class GenerateRefreshTokenAdapter implements GenerateRefreshTokenPort {
  constructor(
    @Inject(JWT_REFRESH_TOKEN_GENERATOR)
    private readonly jwtRefreshTokenGenerator: JwtRefreshTokenGenerator,
  ) {}

  generateRefreshToken(req: GenerateRefreshTokenCmd): string {
    return this.jwtRefreshTokenGenerator.generateRefreshToken(req.payload);
  }
}

export const GENERATE_REFRESH_TOKEN_PORT = 'GENERATE_REFRESH_TOKEN_PORT';
