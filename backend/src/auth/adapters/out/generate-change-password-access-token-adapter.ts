import { Inject } from '@nestjs/common';
import { GenerateChangePasswordAccessTokenCmd } from '../../application/commands/generate-change-password-access-token-cmd';
import { GenerateChangePasswordAccessTokenPort } from '../../application/ports/out/generate-change-password-access-token-port.interface';
import { JwtChangePasswordAccessTokenGenerator } from '../../application/token/jwt-change-password-access-token-generator.interface';
import { JWT_CHANGE_PASSWORD_ACCESS_TOKEN_GENERATOR } from '../../infrastructure/jwt-token-generator/jwt-token-generator';

export class GenerateChangePasswordAccessTokenAdapter implements GenerateChangePasswordAccessTokenPort {
  constructor(
    @Inject(JWT_CHANGE_PASSWORD_ACCESS_TOKEN_GENERATOR)
    private readonly jwtChangePasswordAccessTokenGenerator: JwtChangePasswordAccessTokenGenerator,
  ) {}

  generateChangePasswordAccessToken(
    req: GenerateChangePasswordAccessTokenCmd,
  ): string {
    return this.jwtChangePasswordAccessTokenGenerator.generateChangePasswordAccessToken(
      req.payload,
    );
  }
}

export const GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT =
  'GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT';
