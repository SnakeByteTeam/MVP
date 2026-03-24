import { Module } from '@nestjs/common';
import { UsersController } from './adapters/in/users.controller';
import { 
  CREATE_USER_USE_CASE, 
  DELETE_USER_USE_CASE, 
  FIND_ALL_USERS_USE_CASE, 
  UPDATE_USER_USE_CASE, 
  UsersService 
} from './application/services/users.service';
import { UsersRepositoryImpl } from './infrastructure/persistence/users-repository-impl';
import { CREATE_USER_REPOSITORY } from './application/repository/create-user-repository.interface';
import { DELETE_USER_REPOSITORY } from './application/repository/delete-user-repository.interface';
import { FIND_ALL_USERS_REPOSITORY } from './application/repository/find-all-users-repository.interface';
import { UPDATE_USER_REPOSITORY } from './application/repository/update-user-repository.interface';
import { CREATE_USER_PORT, CreateUserAdapter } from './adapters/out/create-user-adapter';
import { FIND_ALL_USERS_PORT, FindAllUsersAdapter } from './adapters/out/find-all-users-adapter';
import { UPDATE_USER_PORT, UpdateUserAdapter } from './adapters/out/update-user-adapter';
import { DELETE_USER_PORT, DeleteUserAdapter } from './adapters/out/delete-user-adapter';
import { GENERATE_PASSWORD_PORT, GeneratePasswordImpl } from './infrastructure/password-generator/generate-password-impl';
import { HASH_PASSWORD_PORT, HashPasswordImpl } from './infrastructure/hash-password-impl/hash-password-impl';
import { CONVERT_BASE_64_PORT, ConvertBase64Impl } from './infrastructure/convert-base-64-impl/convert-base-64-impl';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: CREATE_USER_USE_CASE,
      useClass: UsersService
    },
    {
      provide: FIND_ALL_USERS_USE_CASE,
      useClass: UsersService
    },
    {
      provide: UPDATE_USER_USE_CASE,
      useClass: UsersService
    },
    {
      provide: DELETE_USER_USE_CASE,
      useClass: UsersService
    },
    {
      provide: CREATE_USER_REPOSITORY,
      useClass: UsersRepositoryImpl
    },
    {
      provide: FIND_ALL_USERS_REPOSITORY,
      useClass: UsersRepositoryImpl
    },
    {
      provide: UPDATE_USER_REPOSITORY,
      useClass: UsersRepositoryImpl
    },
    {
      provide: DELETE_USER_REPOSITORY,
      useClass: UsersRepositoryImpl
    },
    {
      provide: CREATE_USER_PORT,
      useClass: CreateUserAdapter
    },
    {
      provide: FIND_ALL_USERS_PORT,
      useClass: FindAllUsersAdapter
    },
    {
      provide: UPDATE_USER_PORT,
      useClass: UpdateUserAdapter
    },
    {
      provide: DELETE_USER_PORT,
      useClass: DeleteUserAdapter
    },
    {
      provide: GENERATE_PASSWORD_PORT,
      useClass: GeneratePasswordImpl
    },
    {
      provide: HASH_PASSWORD_PORT,
      useClass: HashPasswordImpl
    },
    {
      provide: CONVERT_BASE_64_PORT,
      useClass: ConvertBase64Impl
    }
  ]
})
export class UsersModule {}
