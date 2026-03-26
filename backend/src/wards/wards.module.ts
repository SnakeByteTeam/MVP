import { Module } from '@nestjs/common';
import { WardsController } from './adapters/in/wards.controller';
import {
  CREATE_WARD_USE_CASE,
  DELETE_WARD_USE_CASE,
  FIND_ALL_WARD_USE_CASE,
  UPDATE_WARD_USE_CASE,
  WardService,
} from './application/services/ward.service';
import { CREATE_WARD_REPOSITORY } from './application/repository/create-ward-repository.interface';
import { WardsRepositoryImpl } from './infrastructure/persistence/wards-repository-impl';
import { DELETE_WARD_REPOSITORY } from './application/repository/delete-ward-repository.interface';
import { FIND_ALL_WARDS_REPOSITORY } from './application/repository/find-all-wards-repository.interface';
import { UPDATE_WARD_REPOSITORY } from './application/repository/update-ward-repository.interface';
import { WardsPlantsRelationshipsController } from './adapters/in/wards-plants-relationships.controller';
import { WardsUsersRelationshipsController } from './adapters/in/wards-users-relationships.controller';
import {
  ADD_USER_TO_WARD_USE_CASE,
  FIND_ALL_USERS_BY_WARD_ID_USE_CASE,
  REMOVE_USER_FROM_WARD_USE_CASE,
  WardsUsersRelationshipsService,
} from './application/services/wards-users-relationships.service';
import {
  ADD_PLANT_TO_WARD_USE_CASE,
  FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE,
  REMOVE_PLANT_FROM_WARD_USE_CASE,
  WardsPlantsRelationshipsService,
} from './application/services/wards-plants-relationships.service';
import {
  ADD_USER_TO_WARD_PORT,
  AddUserToWardAdapter,
} from './adapters/out/add-user-to-ward-adapter';
import {
  FIND_ALL_USERS_BY_WARD_ID_PORT,
  FindAllUsersByWardIdAdapter,
} from './adapters/out/find-all-users-by-ward-id-adapter';
import {
  REMOVE_USER_FROM_WARD_PORT,
  RemoveUserFromWardAdapter,
} from './adapters/out/remove-user-from-ward-adapter';
import {
  ADD_PLANT_TO_WARD_PORT,
  AddPlantToWardAdapter,
} from './adapters/out/add-plant-to-ward-adapter';
import {
  FIND_ALL_PLANTS_BY_WARD_ID_PORT,
  FindAllPlantsByWardIdAdapter,
} from './adapters/out/find-all-plants-by-ward-id-adapter';
import {
  REMOVE_PLANT_FROM_WARD_PORT,
  RemovePlantFromWardAdapter,
} from './adapters/out/remove-plant-from-ward-adapter';
import {
  CREATE_WARD_PORT,
  CreateWardAdapter,
} from './adapters/out/create-ward-adapter';
import {
  FIND_ALL_WARDS_PORT,
  FindAllWardsAdapter,
} from './adapters/out/find-all-wards-adapter';
import {
  UPDATE_WARD_PORT,
  UpdateWardAdapter,
} from './adapters/out/update-ward-adapter';
import {
  DELETE_WARD_PORT,
  DeleteWardAdapter,
} from './adapters/out/delete-ward-adapter';
import { ADD_USER_TO_WARD_REPOSITORY } from './application/repository/add-user-to-ward-repository.interface';
import { WardsUsersRelationshipsRepositoryImpl } from './infrastructure/persistence/wards-users-relationships-repository-impl';
import { WardsPlantsRelationshipsRepositoryImpl } from './infrastructure/persistence/wards-plants-relationships-repository-impl';

@Module({
  controllers: [
    WardsController,
    WardsPlantsRelationshipsController,
    WardsUsersRelationshipsController,
  ],
  providers: [
    {
      provide: CREATE_WARD_USE_CASE,
      useClass: WardService,
    },
    {
      provide: FIND_ALL_WARD_USE_CASE,
      useClass: WardService,
    },
    {
      provide: UPDATE_WARD_USE_CASE,
      useClass: WardService,
    },
    {
      provide: DELETE_WARD_USE_CASE,
      useClass: WardService,
    },
    {
      provide: CREATE_WARD_REPOSITORY,
      useClass: WardsRepositoryImpl,
    },
    {
      provide: DELETE_WARD_REPOSITORY,
      useClass: WardsRepositoryImpl,
    },
    {
      provide: FIND_ALL_WARDS_REPOSITORY,
      useClass: WardsRepositoryImpl,
    },
    {
      provide: UPDATE_WARD_REPOSITORY,
      useClass: WardsRepositoryImpl,
    },
    {
      provide: ADD_USER_TO_WARD_USE_CASE,
      useClass: WardsUsersRelationshipsService,
    },
    {
      provide: FIND_ALL_USERS_BY_WARD_ID_USE_CASE,
      useClass: WardsUsersRelationshipsService,
    },
    {
      provide: REMOVE_USER_FROM_WARD_USE_CASE,
      useClass: WardsUsersRelationshipsService,
    },
    {
      provide: ADD_PLANT_TO_WARD_USE_CASE,
      useClass: WardsPlantsRelationshipsService,
    },
    {
      provide: FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE,
      useClass: WardsPlantsRelationshipsService,
    },
    {
      provide: REMOVE_PLANT_FROM_WARD_USE_CASE,
      useClass: WardsPlantsRelationshipsService,
    },
    {
      provide: ADD_USER_TO_WARD_PORT,
      useClass: AddUserToWardAdapter,
    },
    {
      provide: FIND_ALL_USERS_BY_WARD_ID_PORT,
      useClass: FindAllUsersByWardIdAdapter,
    },
    {
      provide: REMOVE_USER_FROM_WARD_PORT,
      useClass: RemoveUserFromWardAdapter,
    },
    {
      provide: ADD_PLANT_TO_WARD_PORT,
      useClass: AddPlantToWardAdapter,
    },
    {
      provide: FIND_ALL_PLANTS_BY_WARD_ID_PORT,
      useClass: FindAllPlantsByWardIdAdapter,
    },
    {
      provide: REMOVE_PLANT_FROM_WARD_PORT,
      useClass: RemovePlantFromWardAdapter,
    },
    {
      provide: CREATE_WARD_PORT,
      useClass: CreateWardAdapter,
    },
    {
      provide: FIND_ALL_WARDS_PORT,
      useClass: FindAllWardsAdapter,
    },
    {
      provide: UPDATE_WARD_PORT,
      useClass: UpdateWardAdapter,
    },
    {
      provide: DELETE_WARD_PORT,
      useClass: DeleteWardAdapter,
    },
    {
      provide: ADD_USER_TO_WARD_REPOSITORY,
      useClass: WardsUsersRelationshipsRepositoryImpl,
    },
    {
      provide: FIND_ALL_USERS_BY_WARD_ID_PORT,
      useClass: WardsUsersRelationshipsRepositoryImpl,
    },
    {
      provide: REMOVE_USER_FROM_WARD_PORT,
      useClass: WardsUsersRelationshipsRepositoryImpl,
    },
    {
      provide: ADD_PLANT_TO_WARD_PORT,
      useClass: WardsPlantsRelationshipsRepositoryImpl,
    },
    {
      provide: FIND_ALL_PLANTS_BY_WARD_ID_PORT,
      useClass: WardsPlantsRelationshipsRepositoryImpl,
    },
    {
      provide: REMOVE_PLANT_FROM_WARD_PORT,
      useClass: WardsPlantsRelationshipsRepositoryImpl,
    },
  ],
})
export class WardsModule {}
