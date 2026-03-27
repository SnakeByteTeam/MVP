import { Module } from '@nestjs/common';
import { PlantController } from './adapters/in/plant.controller';

import { FIND_PLANT_BY_ID_USECASE } from './application/ports/in/find-plant-by-id.usecase';
import { FIND_PLANT_BY_ID_PORT } from './application/ports/out/find-plant-by-id.port';

import { PlantService } from './application/services/plant.service';
import { FindPlantByIdAdapter } from './adapters/out/find-plant-by-id.adapter';
import { FIND_PLANT_BY_ID_REPO_PORT } from './application/repository/find-plant-by-id.repository';
import { PlantRepositoryImpl } from './infrastructure/persistence/plant-repository-impl';

@Module({
  imports: [],
  controllers: [PlantController],
  providers: [
    { provide: FIND_PLANT_BY_ID_USECASE, useClass: PlantService },
    { provide: FIND_PLANT_BY_ID_PORT, useClass: FindPlantByIdAdapter },
    { provide: FIND_PLANT_BY_ID_REPO_PORT, useClass: PlantRepositoryImpl },
  ],
})
export class PlantModule {}
