import { Controller, Delete, Get, Inject, Param, Post } from '@nestjs/common';
import { AddPlantToWardReqDto } from '../../infrastructure/dtos/in/add-plant-to-ward-req-dto';
import { ADD_PLANT_TO_WARD_USE_CASE, FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE, REMOVE_PLANT_FROM_WARD_USE_CASE } from '../../application/services/wards-plants-relationships.service';
import { AddPlantToWardUseCase } from '../../application/ports/in/add-plant-to-ward-use-case.interface';
import { FindAllPlantsByWardIdUseCase } from '../../application/ports/in/find-all-plants-by-ward-id-use-case.interface';
import { RemovePlantFromWardUseCase } from '../../application/ports/in/remove-plant-from-ward-use-case.interface';
import { AddPlantToWardCmd } from '../../application/commands/add-plant-to-ward-cmd';
import { FindAllPlantsByWardIdCmd } from '../../application/commands/find-all-plants-by-ward-id-cmd';
import { RemovePlantFromWardCmd } from '../../application/commands/remove-plant-from-ward-cmd';

@Controller('wards-plants-relationships')
export class WardsPlantsRelationshipsController {

    constructor(
        @Inject(ADD_PLANT_TO_WARD_USE_CASE) private readonly addPlantToWardUseCase: AddPlantToWardUseCase,
        @Inject(FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE) private readonly findAllPlantsByWardIdUseCase: FindAllPlantsByWardIdUseCase,
        @Inject(REMOVE_PLANT_FROM_WARD_USE_CASE) private readonly removePlantFromWardUseCase: RemovePlantFromWardUseCase
    ){}

    @Post()
    addPlantToWard(req: AddPlantToWardReqDto){
        return this.addPlantToWardUseCase.addPlantToWard(
            new AddPlantToWardCmd(
                req.wardId,
                req.plantId
            )
        );
    }
    
    @Get('/:wardId')
    async findAllPlantsByWardId(@Param('wardId') id: number){
        return this.findAllPlantsByWardIdUseCase.findAllPlantsByWardId(
            new FindAllPlantsByWardIdCmd(
                id
            )
        );
    }
    
    @Delete('/:wardId/:plantId')
    removeUserFromWard(
        @Param('wardId') wardId: number,
        @Param('plantId') plantId: number
    ){
        return this.removePlantFromWardUseCase.removePlantFromWard(
            new RemovePlantFromWardCmd(
                wardId,
                plantId
            )
        );
    }
}
