import { Module } from '@nestjs/common';
import { AuthController } from './adapters/in/auth.controller';
import {
  AuthService,
  FIRST_LOGIN_USE_CASE,
  LOGIN_USE_CASE,
  REFRESH_USE_CASE,
} from './application/services/auth.service';
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
import {
  GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT,
  GenerateChangePasswordAccessTokenAdapter,
} from './adapters/out/generate-change-password-access-token-adapter';
import {
  GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT,
  GenerateChangePasswordRefreshTokenAdapter,
} from './adapters/out/generate-change-password-refresh-token-adapter';
import {
  CredentialsPersistenceAdapter,
} from './adapters/out/credentials-persistence-adapter';
import {
  PASSWORD_HASHER,
  Sha512PasswordHasher,
} from './infrastructure/sha512-password-hasher/sha512-password-hasher';
import {
  HASH_PASSWORD_PORT,
  HashPasswordAdapter,
} from './adapters/out/hash-password-adapter';
import { CHECK_CREDENTIALS_PORT } from './application/ports/out/check-credentials-port.interface';
import { CREDENTIALS_REPOSITORY } from './application/repository/credentials-repository.interface';
import { CredentialsRepositoryImpl } from './infrastructure/persistence/credentials-repository-impl';
import { CHANGE_CREDENTIALS_PORT } from './application/ports/out/change-credentials-port.interface';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: FIRST_LOGIN_USE_CASE,
      useClass: AuthService,
    },
    {
      provide: LOGIN_USE_CASE,
      useClass: AuthService,
    },
    {
      provide: REFRESH_USE_CASE,
      useClass: AuthService,
    },
    {
      provide: CHECK_CREDENTIALS_PORT,
      useClass: CredentialsPersistenceAdapter,
    },
    {
      provide: CHANGE_CREDENTIALS_PORT,
      useClass: CredentialsPersistenceAdapter,
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
      provide: CREDENTIALS_REPOSITORY,
      useClass: CredentialsRepositoryImpl,
    },
    {
      provide: HASH_PASSWORD_PORT,
      useClass: HashPasswordAdapter,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: Sha512PasswordHasher,
    },
  ],
})
export class AuthModule {}
