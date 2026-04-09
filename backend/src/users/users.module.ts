import { Module } from '@nestjs/common';
import { UsersController } from './adapters/in/users.controller';
import { GuardModule } from 'src/guard/guard.module';
import {
  CREATE_USER_USE_CASE,
  DELETE_USER_USE_CASE,
  FIND_ALL_AVAILABLE_USERS_USE_CASE,
  FIND_ALL_USERS_USE_CASE,
  FIND_USER_BY_ID_USE_CASE,
  UPDATE_USER_USE_CASE,
  UsersService,
} from './application/services/users.service';
import { UsersRepositoryImpl } from './infrastructure/persistence/users-repository-impl';
import {
  GENERATE_PASSWORD_PORT,
  GeneratePasswordImpl,
} from './infrastructure/password-generator/generate-password-impl';
import {
  HASH_PASSWORD_PORT,
  HashPasswordImpl,
} from './infrastructure/hash-password-impl/hash-password-impl';
import {
  CONVERT_BASE_64_PORT,
  ConvertBase64Impl,
} from './infrastructure/convert-base-64-impl/convert-base-64-impl';
import { USER_REPOSITORY } from './application/repository/user-repository.interface';
import { UserPersistenceAdapter } from './adapters/out/user-persistence-adapter';
import { CREATE_USER_PORT } from './application/ports/out/create-user-port.interface';
import { DELETE_USER_PORT } from './application/ports/out/delete-user-port.interface';
import { FIND_ALL_AVAILABLE_USERS_PORT } from './application/ports/out/find-all-available-users-port.interface';
import { FIND_ALL_USERS_PORT } from './application/ports/out/find-all-users-port.interface';
import { FIND_USER_BY_ID_PORT } from './application/ports/out/find-user-by-id-port.interface';
import { UPDATE_USER_PORT } from './application/ports/out/update-user-port.interface';

@Module({
  imports: [GuardModule],
  controllers: [UsersController],
  providers: [
    {
      provide: CREATE_USER_USE_CASE,
      useClass: UsersService,
    },
    {
      provide: FIND_ALL_AVAILABLE_USERS_USE_CASE,
      useClass: UsersService,
    },
    {
      provide: FIND_USER_BY_ID_USE_CASE,
      useClass: UsersService,
    },
    {
      provide: FIND_ALL_USERS_USE_CASE,
      useClass: UsersService,
    },
    {
      provide: UPDATE_USER_USE_CASE,
      useClass: UsersService,
    },
    {
      provide: DELETE_USER_USE_CASE,
      useClass: UsersService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UsersRepositoryImpl,
    },
    {
      provide: CREATE_USER_PORT,
      useClass: UserPersistenceAdapter,
    },
    {
      provide: FIND_ALL_USERS_PORT,
      useClass: UserPersistenceAdapter,
    },
    {
      provide: FIND_USER_BY_ID_PORT,
      useClass: UserPersistenceAdapter,
    },
    {
      provide: FIND_ALL_AVAILABLE_USERS_PORT,
      useClass: UserPersistenceAdapter,
    },
    {
      provide: UPDATE_USER_PORT,
      useClass: UserPersistenceAdapter,
    },
    {
      provide: DELETE_USER_PORT,
      useClass: UserPersistenceAdapter,
    },
    {
      provide: GENERATE_PASSWORD_PORT,
      useClass: GeneratePasswordImpl,
    },
    {
      provide: HASH_PASSWORD_PORT,
      useClass: HashPasswordImpl,
    },
    {
      provide: CONVERT_BASE_64_PORT,
      useClass: ConvertBase64Impl,
    },
  ],
})
export class UsersModule {}
