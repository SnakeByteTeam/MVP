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

  ]
})
export class WardsModule { }
