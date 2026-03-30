import { Module } from '@nestjs/common';
import { PlantController } from './adapters/in/plant.controller';

import { FIND_PLANT_BY_ID_USECASE } from './application/ports/in/find-plant-by-id.usecase';
import { FIND_PLANT_BY_ID_PORT } from './application/ports/out/find-plant-by-id.port';

import { PlantService } from './application/services/plant.service';
import { FindPlantByIdAdapter } from './adapters/out/find-plant-by-id.adapter';
import { FIND_PLANT_BY_ID_REPO_PORT } from './application/repository/find-plant-by-id.repository';
import { PlantRepositoryImpl } from './infrastructure/persistence/plant-repository-impl';
import { FIND_ALL_AVAILABLE_PLANTS_USECASE } from './application/ports/in/find-all-available-plants.usecase';
import { FIND_ALL_AVAILABLE_PLANTS_PORT } from './application/ports/out/find-all-available-plants.port';
import { FindAllAvailablePlantsAdapter } from './adapters/out/find-all-available-plants.adapter';
import { FIND_ALL_AVAILABLE_PLANTS_REPO_PORT } from './application/repository/find-all-plants.repository';

@Module({
  imports: [],
  controllers: [PlantController],
  providers: [
    { provide: FIND_PLANT_BY_ID_USECASE, useClass: PlantService },
    { provide: FIND_PLANT_BY_ID_PORT, useClass: FindPlantByIdAdapter },
    { provide: FIND_PLANT_BY_ID_REPO_PORT, useClass: PlantRepositoryImpl },
    { provide: FIND_ALL_AVAILABLE_PLANTS_USECASE, useClass: PlantService },
    {
      provide: FIND_ALL_AVAILABLE_PLANTS_PORT,
      useClass: FindAllAvailablePlantsAdapter,
    },
    {
      provide: FIND_ALL_AVAILABLE_PLANTS_REPO_PORT,
      useClass: PlantRepositoryImpl,
    },
  ],
})
export class PlantModule {}
