import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AddPlantToWardReqDto } from '../../infrastructure/dtos/in/add-plant-to-ward-req.dto';
import {
  ADD_PLANT_TO_WARD_USE_CASE,
  FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE,
  REMOVE_PLANT_FROM_WARD_USE_CASE,
} from '../../application/services/wards-plants-relationships.service';
import { AddPlantToWardUseCase } from '../../application/ports/in/add-plant-to-ward-use-case.interface';
import { FindAllPlantsByWardIdUseCase } from '../../application/ports/in/find-all-plants-by-ward-id-use-case.interface';
import { RemovePlantFromWardUseCase } from '../../application/ports/in/remove-plant-from-ward-use-case.interface';
import { AddPlantToWardCmd } from '../../application/commands/add-plant-to-ward-cmd';
import { FindAllPlantsByWardIdCmd } from '../../application/commands/find-all-plants-by-ward-id-cmd';
import { RemovePlantFromWardCmd } from '../../application/commands/remove-plant-from-ward-cmd';
import { FindAllPlantsByWardIdResDto } from '../../infrastructure/dtos/out/find-all-plants-by-ward-id-res.dto';
import { plainToInstance } from 'class-transformer';
import { AddPlantToWardResDto } from '../../infrastructure/dtos/out/add-plant-to-ward-res-dto';
import { Plant } from '../../domain/plant';

@Controller('wards-plants-relationships')
export class WardsPlantsRelationshipsController {
  constructor(
    @Inject(ADD_PLANT_TO_WARD_USE_CASE)
    private readonly addPlantToWardUseCase: AddPlantToWardUseCase,
    @Inject(FIND_ALL_PLANTS_BY_WARD_ID_USE_CASE)
    private readonly findAllPlantsByWardIdUseCase: FindAllPlantsByWardIdUseCase,
    @Inject(REMOVE_PLANT_FROM_WARD_USE_CASE)
    private readonly removePlantFromWardUseCase: RemovePlantFromWardUseCase,
  ) { }

  @Post()
  async addPlantToWard(
    @Body() req: AddPlantToWardReqDto,
  ): Promise<AddPlantToWardResDto> {
    const plant: Plant = this.addPlantToWardUseCase.addPlantToWard(
      new AddPlantToWardCmd(req.wardId, req.plantId),
    );

    return plainToInstance(AddPlantToWardResDto, plant);
  }

  @Get('/:wardId')
  async findAllPlantsByWardId(
    @Param('wardId', ParseIntPipe) id: number,
  ): Promise<FindAllPlantsByWardIdResDto[]> {
    const plants: Plant[] =
      await this.findAllPlantsByWardIdUseCase.findAllPlantsByWardId(
        new FindAllPlantsByWardIdCmd(id),
      );

    return plainToInstance(FindAllPlantsByWardIdResDto, plants);
  }

  @Delete('/:plantId')
  removeUserFromWard(@Param('plantId') plantId: string): Promise<void> {
    return this.removePlantFromWardUseCase.removePlantFromWard(
      new RemovePlantFromWardCmd(plantId),
    );
  }
}
