import { Module } from '@nestjs/common';
import { UsersController } from './adapters/in/users.controller';
import { USERS_SERVICE, UsersService } from './application/services/users.service';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_SERVICE,
      useClass: UsersService
    }
  ]
})
export class UsersModule {}
