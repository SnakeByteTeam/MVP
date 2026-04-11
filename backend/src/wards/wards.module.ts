import { Module } from '@nestjs/common';
import { WardsController } from './adapters/in/wards.controller';
import { GuardModule } from 'src/guard/guard.module';
import {
  CREATE_WARD_USE_CASE,
  DELETE_WARD_USE_CASE,
  FIND_ALL_WARD_USE_CASE,
  UPDATE_WARD_USE_CASE,
  WardService,
} from './application/services/ward.service';
import { WardsRepositoryImpl } from './infrastructure/persistence/wards-repository-impl';
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
import { WardsUsersRelationshipsRepositoryImpl } from './infrastructure/persistence/wards-users-relationships-repository-impl';
import { WardsPlantsRelationshipsRepositoryImpl } from './infrastructure/persistence/wards-plants-relationships-repository-impl';
import { WARDS_REPOSITORY } from './application/repository/wards-repository.interface';
import { CREATE_WARD_PORT } from './application/ports/out/create-ward-port.interface';
import { FIND_ALL_WARDS_PORT } from './application/ports/out/find-all-wards-port.interface';
import { WardsPersistenceAdapter } from './adapters/out/wards-persistence-adapter';
import { UPDATE_WARD_PORT } from './application/ports/out/update-ward-port.interface';
import { DELETE_WARD_PORT } from './application/ports/out/delete-ward-port.interface';
import { WARDS_USERS_RELATIONSHIPS_REPOSITORY } from './application/repository/wards-users-relationships-repository.interface';
import { WARDS_PLANTS_RELATIONSHIPS_REPOSITORY } from './application/repository/wards-plants-relationships-repository.interface';
import { WardsUsersRelationshipsPersistenceAdapter } from './adapters/out/wards-users-relationships-persistence-adapter';
import { REMOVE_USER_FROM_WARD_PORT } from './application/ports/out/remove-user-from-ward-port.interface';
import { FIND_ALL_USERS_BY_WARD_ID_PORT } from './application/ports/out/find-all-users-by-ward-id-port.interface';
import { ADD_USER_TO_WARD_PORT } from './application/ports/out/add-user-to-ward-port.interface';
import { WardsPlantsRelationshipsPersistenceAdapter } from './adapters/out/wards-plants-relationships-persistence-adapter';
import { ADD_PLANT_TO_WARD_PORT } from './application/ports/out/add-plant-to-ward-port.interface';
import { FIND_ALL_PLANTS_BY_WARD_ID_PORT } from './application/ports/out/find-all-plants-by-ward-id-port.interface';
import { REMOVE_PLANT_FROM_WARD_PORT } from './application/ports/out/remove-plant-from-ward-port.interface';

@Module({
  imports: [GuardModule],
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
      provide: WARDS_REPOSITORY,
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
      useClass: WardsUsersRelationshipsPersistenceAdapter,
    },
    {
      provide: FIND_ALL_USERS_BY_WARD_ID_PORT,
      useClass: WardsUsersRelationshipsPersistenceAdapter,
    },
    {
      provide: REMOVE_USER_FROM_WARD_PORT,
      useClass: WardsUsersRelationshipsPersistenceAdapter,
    },
    {
      provide: ADD_PLANT_TO_WARD_PORT,
      useClass: WardsPlantsRelationshipsPersistenceAdapter,
    },
    {
      provide: FIND_ALL_PLANTS_BY_WARD_ID_PORT,
      useClass: WardsPlantsRelationshipsPersistenceAdapter,
    },
    {
      provide: REMOVE_PLANT_FROM_WARD_PORT,
      useClass: WardsPlantsRelationshipsPersistenceAdapter,
    },
    {
      provide: CREATE_WARD_PORT,
      useClass: WardsPersistenceAdapter,
    },
    {
      provide: FIND_ALL_WARDS_PORT,
      useClass: WardsPersistenceAdapter,
    },
    {
      provide: UPDATE_WARD_PORT,
      useClass: WardsPersistenceAdapter,
    },
    {
      provide: DELETE_WARD_PORT,
      useClass: WardsPersistenceAdapter,
    },
    {
      provide: WARDS_USERS_RELATIONSHIPS_REPOSITORY,
      useClass: WardsUsersRelationshipsRepositoryImpl,
    },
    {
      provide: WARDS_PLANTS_RELATIONSHIPS_REPOSITORY,
      useClass: WardsPlantsRelationshipsRepositoryImpl,
    },
  ],
})
export class WardsModule {}
