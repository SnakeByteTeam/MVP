import { Module } from '@nestjs/common';
import { AuthController } from './adapters/in/auth.controller';
import { AuthService, LOGIN_USE_CASE, LOGOUT_USE_CASE, REFRESH_USE_CASE } from './application/services/auth.service';
import { CHECK_CREDENTIALS_PORT, CheckCredentialsAdapter } from './adapters/out/check-credentials-adapter';
import { 
  JWT_ACCESS_TOKEN_EXTRACTOR, 
  JWT_ACCESS_TOKEN_GENERATOR, 
  JWT_REFRESH_TOKEN_EXTRACTOR, 
  JWT_REFRESH_TOKEN_GENERATOR, 
  JwtTokenGenerator 
} from './infrastructure/jwt-token-generator/jwt-token-generator';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: LOGIN_USE_CASE,
      useClass: AuthService
    },
    {
      provide: REFRESH_USE_CASE,
      useClass: AuthService
    },
    {
      provide: LOGOUT_USE_CASE,
      useClass: AuthService
    },
    {
      provide: CHECK_CREDENTIALS_PORT,
      useClass: CheckCredentialsAdapter
    },
    {
      provide: JWT_ACCESS_TOKEN_GENERATOR,
      useClass: JwtTokenGenerator
    },
    {
      provide: JWT_REFRESH_TOKEN_GENERATOR,
      useClass: JwtTokenGenerator
    },
    {
      provide: JWT_ACCESS_TOKEN_EXTRACTOR,
      useClass: JwtTokenGenerator
    },
    {
      provide: JWT_REFRESH_TOKEN_EXTRACTOR,
      useClass: JwtTokenGenerator
    }
  ]
})
export class AuthModule {}