import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';
import { PlantController } from './adapters/in/plant.controller';

import { SYNC_PLANT_STRUCTURE_USECASE } from './application/ports/in/sync-plant-structure.usecase';
import { FIND_PLANT_BY_ID_USECASE } from './application/ports/in/find-plant-by-id.usecase';
import { FETCH_PLANT_STRUCTURE_PORT } from './application/ports/out/fetch-plant-structure.port';
import { FIND_PLANT_BY_ID_PORT } from './application/ports/out/find-plant-by-id.port';
import { WRITE_STRUCTURE_PORT } from './application/ports/out/write-plant-structure.port';
import { FETCH_PLANT_STRUCTURE_REPO_PORT } from './application/repository/fetch-plant-structure.repository';
import { FIND_PLANT_BY_ID_REPO_PORT } from './application/repository/find-plant-by-id.repository';
import { WRITE_PLANT_STRUCTURE_REPO_PORT } from './application/repository/write-plant-structure.repository';

import { PlantService } from './application/services/plant.service';
import { SyncPlantService } from './application/services/sync-plant.service';
import { FetchPlantStructureAdapter } from './adapters/out/fetch-plant-structure.adapter';
import { FindPlantByIdAdapter } from './adapters/out/find-plant-by-id.adapter';
import { WritePlantStructureAdapter } from './adapters/out/write-plant-structure.adapter';
import { FetchPlantStructureImpl } from './infrastructure/http/fetch-plant-structure-impl';
import { PlantRepository } from './infrastructure/persistence/plant-repository-impl';

@Module({
    imports: [TokensModule, HttpModule],
    controllers: [PlantController],
    providers: [
        {provide: FIND_PLANT_BY_ID_USECASE,         useClass: PlantService},
        {provide: FIND_PLANT_BY_ID_PORT,            useClass: FindPlantByIdAdapter},
        {provide: FIND_PLANT_BY_ID_REPO_PORT,       useClass: PlantRepository},
        {provide: SYNC_PLANT_STRUCTURE_USECASE,     useClass: SyncPlantService},
        {provide: FETCH_PLANT_STRUCTURE_PORT,       useClass: FetchPlantStructureAdapter},
        {provide: FETCH_PLANT_STRUCTURE_REPO_PORT,  useClass: FetchPlantStructureImpl },
        {provide: WRITE_STRUCTURE_PORT,             useClass: WritePlantStructureAdapter},
        {provide: WRITE_PLANT_STRUCTURE_REPO_PORT,  useClass: PlantRepository},
    ]
})
export class PlantModule {
    
}
