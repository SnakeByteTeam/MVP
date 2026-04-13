import { Module } from '@nestjs/common';
import { AuthController } from './adapters/in/auth.controller';
import {
  AuthService,
  FIRST_LOGIN_USE_CASE,
  LOGIN_USE_CASE,
  REFRESH_USE_CASE,
} from './application/services/auth.service';
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
import { JwtTokenGeneratorAndExtractorImpl } from './infrastructure/jwt-token-generator/jwt-token-generator-and-extractor-impl';
import { GENERATE_REFRESH_TOKEN_PORT, GenerateAndExtractTokenAdapter } from './adapters/out/generate-and-extract-token-adapter';
import { GENERATE_ACCESS_TOKEN_PORT } from './application/ports/out/generate-access-token-port.interface';
import { GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT } from './application/ports/out/generate-change-password-access-token-port.interface';
import { GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT } from './application/ports/out/generate-change-password-refresh-token-port.interface';
import { EXTRACT_FROM_ACCESS_TOKEN_PORT } from './application/ports/out/extract-from-access-token-port.interface';
import { EXTRACT_FROM_REFRESH_TOKEN_PORT } from './application/ports/out/extract-from-refresh-token-port.interface';
import { JWT_TOKEN_GENERATOR_AND_EXTRACTOR } from './application/token/jwt-token-generator-and-extractor.interface';

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
      useClass: GenerateAndExtractTokenAdapter,
    },
    {
      provide: GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT,
      useClass: GenerateAndExtractTokenAdapter,
    },
    {
      provide: JWT_TOKEN_GENERATOR_AND_EXTRACTOR,
      useClass: JwtTokenGeneratorAndExtractorImpl,
    },
    {
      provide: GENERATE_ACCESS_TOKEN_PORT,
      useClass: GenerateAndExtractTokenAdapter,
    },
    {
      provide: GENERATE_REFRESH_TOKEN_PORT,
      useClass: GenerateAndExtractTokenAdapter,
    },
    {
      provide: EXTRACT_FROM_ACCESS_TOKEN_PORT,
      useClass: GenerateAndExtractTokenAdapter,
    },
    {
      provide: EXTRACT_FROM_REFRESH_TOKEN_PORT,
      useClass: GenerateAndExtractTokenAdapter,
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
