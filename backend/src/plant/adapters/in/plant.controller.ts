import { Controller, Query, Get, Inject} from "@nestjs/common";
import { SYNC_PLANT_STRUCTURE_USECASE, type SyncPlantStructureUseCase } from "src/plant/application/ports/in/sync-plant-structure.usecase";

@Controller('plant')
export class PlantController {

    constructor(
        @Inject(SYNC_PLANT_STRUCTURE_USECASE) private readonly syncUseCase: SyncPlantStructureUseCase
    ) {}

    @Get()
    async sync(@Query('plantid') plantId: string) {
        this.syncUseCase.sync(plantId);
    }
}