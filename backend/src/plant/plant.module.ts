import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';
import { PlantController } from './adapters/in/plant.controller';

import { SYNC_PLANT_STRUCTURE_USECASE } from './application/ports/in/sync-plant-structure.usecase';
import { FETCH_PLANT_STRUCTURE_PORT } from './application/ports/out/fetch-plant-structure.port';
import { FETCH_PLANT_STRUCTURE_REPO_PORT } from './application/repository/fetch-plant-structure.repository';

import { PlantService } from './application/services/plant.service';
import { FetchPlantStructureAdapter } from './adapters/out/fetch-plant-structure.adapter';
import { FetchPlantStructureImpl } from './infrastructure/http/fetch-plant-structure-impl';

@Module({
    imports: [TokensModule, HttpModule],
    controllers: [PlantController],
    providers: [
        {provide: SYNC_PLANT_STRUCTURE_USECASE,     useClass: PlantService}, 
        {provide: FETCH_PLANT_STRUCTURE_PORT,       useClass: FetchPlantStructureAdapter}, 
        {provide: FETCH_PLANT_STRUCTURE_REPO_PORT,  useClass: FetchPlantStructureImpl }
    ]
})
export class PlantModule {
    
}
