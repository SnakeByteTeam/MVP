import { Module } from '@nestjs/common';
import { AuthController } from './adapters/in/auth.controller';
import { AuthService, LOGIN_USE_CASE } from './application/services/auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: LOGIN_USE_CASE,
      useClass: AuthService
    }
  ]
})
export class AuthModule {}
