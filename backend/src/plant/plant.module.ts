import { Module } from '@nestjs/common';
import { PlantController } from './adapters/in/plant.controller';
import { GuardModule } from 'src/guard/guard.module';

import { FIND_PLANT_BY_ID_USECASE } from './application/ports/in/find-plant-by-id.usecase';
import { FIND_PLANT_BY_ID_PORT } from './application/ports/out/find-plant-by-id.port';

import { PlantService } from './application/services/plant.service';
import { PlantAdapter } from './adapters/out/plant.adapter';
import { PlantRepositoryImpl } from './infrastructure/persistence/plant-repository-impl';
import { FIND_ALL_AVAILABLE_PLANTS_USECASE } from './application/ports/in/find-all-available-plants.usecase';
import { FIND_ALL_AVAILABLE_PLANTS_PORT } from './application/ports/out/find-all-available-plants.port';
import { FIND_ALL_PLANTS_USECASE } from './application/ports/in/find-all-plants.usecase';
import { FIND_ALL_PLANTS_PORT } from './application/ports/out/find-all-plants.port';
import { PLANT_REPOSITORY_PORT } from './application/repository/plant.repository';

@Module({
  imports: [GuardModule],
  controllers: [PlantController],
  providers: [
    // Use cases
    { provide: FIND_PLANT_BY_ID_USECASE, useClass: PlantService },
    { provide: FIND_ALL_AVAILABLE_PLANTS_USECASE, useClass: PlantService },
    { provide: FIND_ALL_PLANTS_USECASE, useClass: PlantService },
    
    // Unified port & adapter
    { provide: PLANT_REPOSITORY_PORT, useClass: PlantRepositoryImpl },
    { provide: FIND_PLANT_BY_ID_PORT, useClass: PlantAdapter },
    { provide: FIND_ALL_AVAILABLE_PLANTS_PORT, useClass: PlantAdapter },
    { provide: FIND_ALL_PLANTS_PORT, useClass: PlantAdapter },
    
    // Standalone dependencies
    PlantRepositoryImpl,
  ],
})
export class PlantModule {}
