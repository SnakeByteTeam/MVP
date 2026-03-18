import { Module } from '@nestjs/common';
import { UsersController } from './adapters/in/users.controller';
import { 
  CREATE_USER_USE_CASE, 
  DELETE_USER_USE_CASE, 
  FIND_ALL_USERS_USE_CASE, 
  UPDATE_USER_USE_CASE, 
  UsersService 
} from './application/services/users.service';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: FIND_ALL_USERS_USE_CASE,
      useClass: UsersService
    },
    {
      provide: UPDATE_USER_USE_CASE,
      useClass: UsersService
    },
    {
      provide: CREATE_USER_USE_CASE,
      useClass: UsersService
    },
    {
      provide: DELETE_USER_USE_CASE,
      useClass: UsersService
    }
  ]
})
export class UsersModule {}
