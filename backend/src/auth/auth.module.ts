import { Module } from '@nestjs/common';
import { AuthController } from './adapters/in/auth.controller';
import {
  AuthService,
  LOGIN_USE_CASE,
  LOGOUT_USE_CASE,
  REFRESH_USE_CASE,
} from './application/services/auth.service';
import {
  CHECK_CREDENTIALS_PORT,
  CheckCredentialsAdapter,
} from './adapters/out/check-credentials-adapter';
import {
  JWT_ACCESS_TOKEN_EXTRACTOR,
  JWT_ACCESS_TOKEN_GENERATOR,
  JWT_CHANGE_PASSWORD_ACCESS_TOKEN_GENERATOR,
  JWT_CHANGE_PASSWORD_REFRESH_TOKEN_GENERATOR,
  JWT_REFRESH_TOKEN_EXTRACTOR,
  JWT_REFRESH_TOKEN_GENERATOR,
  JwtTokenGenerator,
} from './infrastructure/jwt-token-generator/jwt-token-generator';
import {
  GENERATE_ACCESS_TOKEN_PORT,
  GenerateAccessTokenAdapter,
} from './adapters/out/generate-access-token-adapter';
import {
  GENERATE_REFRESH_TOKEN_PORT,
  GenerateRefreshTokenAdapter,
} from './adapters/out/generate-refresh-token-adapter';
import {
  EXTRACT_FROM_ACCESS_TOKEN_PORT,
  ExtractFromAccessTokenAdapter,
} from './adapters/out/extract-from-access-token-adapter';
import {
  EXTRACT_FROM_REFRESH_TOKEN_PORT,
  ExtractFromRefreshTokenAdapter,
} from './adapters/out/extract-from-refresh-token-adapter';
import { CHECK_CREDENTIALS_REPOSITORY } from './application/repository/check-credentials-repository.interface';
import { CheckCredentialsRepositoryImpl } from './infrastructure/persistence/check-credentials-repository-impl';
import { CHANGE_CREDENTIALS_REPOSITORY } from './application/repository/change-credentials-repository.interface';
import { ChangeCredentialsRepositoryImpl } from './infrastructure/persistence/change-credentials-repository-impl';
import { GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT, GenerateChangePasswordAccessTokenAdapter } from './adapters/out/generate-change-password-access-token-adapter';
import { GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT, GenerateChangePasswordRefreshTokenAdapter } from './adapters/out/generate-change-password-refresh-token-adapter';
import { CHANGE_CREDENTIALS_PORT } from './adapters/out/change-credentials-adapter';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: LOGIN_USE_CASE,
      useClass: AuthService,
    },
    {
      provide: REFRESH_USE_CASE,
      useClass: AuthService,
    },
    {
      provide: LOGOUT_USE_CASE,
      useClass: AuthService,
    },
    {
      provide: CHECK_CREDENTIALS_PORT,
      useClass: CheckCredentialsAdapter,
    },
    {
      provide: CHANGE_CREDENTIALS_PORT,
      useClass: CheckCredentialsAdapter,
    },
    {
      provide: GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT,
      useClass: GenerateChangePasswordAccessTokenAdapter,
    },
    {
      provide: GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT,
      useClass: GenerateChangePasswordRefreshTokenAdapter,
    },
    {
      provide: JWT_ACCESS_TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: JWT_REFRESH_TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: JWT_CHANGE_PASSWORD_ACCESS_TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: JWT_CHANGE_PASSWORD_REFRESH_TOKEN_GENERATOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: JWT_ACCESS_TOKEN_EXTRACTOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: JWT_REFRESH_TOKEN_EXTRACTOR,
      useClass: JwtTokenGenerator,
    },
    {
      provide: GENERATE_ACCESS_TOKEN_PORT,
      useClass: GenerateAccessTokenAdapter,
    },
    {
      provide: GENERATE_REFRESH_TOKEN_PORT,
      useClass: GenerateRefreshTokenAdapter,
    },
    {
      provide: EXTRACT_FROM_ACCESS_TOKEN_PORT,
      useClass: ExtractFromAccessTokenAdapter,
    },
    {
      provide: EXTRACT_FROM_REFRESH_TOKEN_PORT,
      useClass: ExtractFromRefreshTokenAdapter,
    },
    {
      provide: CHECK_CREDENTIALS_REPOSITORY,
      useClass: CheckCredentialsRepositoryImpl,
    },
    {
      provide: CHANGE_CREDENTIALS_REPOSITORY,
      useClass: ChangeCredentialsRepositoryImpl
    }
  ],
})
export class AuthModule {}
