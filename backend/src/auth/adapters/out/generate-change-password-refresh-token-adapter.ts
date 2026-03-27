import { Inject } from '@nestjs/common';
import { GenerateChangePasswordRefreshTokenCmd } from '../../application/commands/generate-change-password-refresh-token-cmd';
import { GenerateChangePasswordRefreshTokenPort } from '../../application/ports/out/generate-change-password-refresh-token-port.interface';
import { JWT_CHANGE_PASSWORD_REFRESH_TOKEN_GENERATOR } from '../../infrastructure/jwt-token-generator/jwt-token-generator';
import { JwtChangePasswordRefreshTokenGenerator } from '../../application/token/jwt-change-password-refresh-token-generator.interface';

export class GenerateChangePasswordRefreshTokenAdapter implements GenerateChangePasswordRefreshTokenPort {
  constructor(
    @Inject(JWT_CHANGE_PASSWORD_REFRESH_TOKEN_GENERATOR)
    private readonly jwtChangePasswordRefreshTokenGenerator: JwtChangePasswordRefreshTokenGenerator,
  ) {}

  generateChangePasswordRefreshToken(
    req: GenerateChangePasswordRefreshTokenCmd,
  ): string {
    return this.jwtChangePasswordRefreshTokenGenerator.generateChangePasswordRefreshToken(
      req.payload,
    );
  }
}

export const GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT =
  'GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT';
