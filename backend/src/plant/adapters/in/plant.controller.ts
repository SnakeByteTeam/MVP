import { Controller, Query, Get, Inject} from "@nestjs/common";
import { FIND_PLANT_BY_ID_USECASE, type FindPlantByIdUseCase } from "src/plant/application/ports/in/find-plant-by-id.usecase";
import { Plant } from "src/plant/domain/models/plant.model";
import { PlantDto } from "src/plant/infrastructure/http/dtos/plant.dto";

@Controller('plant')
export class PlantController {

    constructor(
        @Inject(FIND_PLANT_BY_ID_USECASE) private readonly findPlantById: FindPlantByIdUseCase
    ) {}

    @Get()
    async findById(@Query('plantid') plantId: string) {
        const plant: Plant = await this.findPlantById.findById(plantId);
        return PlantDto.fromDomain(plant);
    }
}