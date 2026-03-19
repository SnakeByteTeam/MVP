import { Module } from '@nestjs/common';
import { ApiAuthVimarController } from './adapters/in/api-auth-vimar/api-auth-vimar.controller';
import { APIAUTHUSECASE } from './application/ports/in/api-auth.usecase';
import { ApiAuthVimarService } from './application/services/api-auth-vimar.service';

@Module({
  controllers: [ApiAuthVimarController],
  providers: [
    {
      provide: APIAUTHUSECASE,  useClass: ApiAuthVimarService
    }
  ],  
  exports: [APIAUTHUSECASE]
})
export class ApiAuthVimarModule {}
