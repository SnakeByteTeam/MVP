import { Module } from '@nestjs/common';
import { WardsController } from './adapters/in/wards.controller';
import { 
  CREATE_WARD_USE_CASE, 
  DELETE_WARD_USE_CASE, 
  FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE, 
  FIND_ALL_USERS_BY_WARD_ID_USE_CASE, 
  FIND_ALL_WARD_USE_CASE, 
  UPDATE_WARD_USE_CASE, 
  WardService 
} from './application/services/ward-service';
import { CREATE_WARD_REPOSITORY } from './application/repository/create-ward-repository.interface';
import { WardsRepositoryImpl } from './infrastructure/persistence/wards-repository-impl';
import { DELETE_WARD_REPOSITORY } from './application/repository/delete-ward-repository.interface';
import { FIND_ALL_WARDS_REPOSITORY } from './application/repository/find-all-wards-repository.interface';
import { UPDATE_WARD_REPOSITORY } from './application/repository/update-ward-repository.interface';

@Module({
  controllers: [WardsController],
  providers: [
    {
      provide: CREATE_WARD_USE_CASE,
      useClass: WardService
    },
    {
      provide: FIND_ALL_WARD_USE_CASE,
      useClass: WardService
    },
    {
      provide: FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE,
      useClass: WardService
    },
    {
      provide: FIND_ALL_USERS_BY_WARD_ID_USE_CASE,
      useClass: WardService
    },
    {
      provide: UPDATE_WARD_USE_CASE,
      useClass: WardService
    },
    {
      provide: DELETE_WARD_USE_CASE,
      useClass: WardService
    },
    {
      provide: CREATE_WARD_REPOSITORY,
      useClass: WardsRepositoryImpl
    },
    {
      provide: DELETE_WARD_REPOSITORY,
      useClass: WardsRepositoryImpl
    },
    {
      provide: FIND_ALL_WARDS_REPOSITORY,
      useClass: WardsRepositoryImpl
    },
    {
      provide: UPDATE_WARD_REPOSITORY,
      useClass: WardsRepositoryImpl
    }
  ]
})
export class WardsModule { }
