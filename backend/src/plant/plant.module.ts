import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';
import { PlantController } from './adapters/in/plant.controller';

import { FIND_PLANT_BY_ID_USECASE } from './application/ports/in/find-plant-by-id.usecase';
import { FIND_PLANT_BY_ID_PORT } from './application/ports/out/find-plant-by-id.port';


import { PlantService } from './application/services/plant.service';
import { FindPlantByIdAdapter } from './adapters/out/find-plant-by-id.adapter';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [TokensModule, HttpModule, CacheModule],
  controllers: [PlantController],
  providers: [
    { provide: FIND_PLANT_BY_ID_USECASE, useClass: PlantService },
    { provide: FIND_PLANT_BY_ID_PORT, useClass: FindPlantByIdAdapter }
  ],
})
export class PlantModule {}
