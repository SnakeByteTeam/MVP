import {
  Controller,
  Query,
  Get,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FindPlantByIdCmd } from 'src/plant/application/commands/find-plant-by-id.command';
import {
  FIND_ALL_AVAILABLE_PLANTS_USECASE,
  type FindAllAvailablePlantsUseCase,
} from 'src/plant/application/ports/in/find-all-available-plants.usecase';
import {
  FIND_PLANT_BY_ID_USECASE,
  type FindPlantByIdUseCase,
} from 'src/plant/application/ports/in/find-plant-by-id.usecase';
import { Plant } from 'src/plant/domain/models/plant.model';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';

@ApiTags('plant')
@Controller('plant')
export class PlantController {
  constructor(
    @Inject(FIND_PLANT_BY_ID_USECASE)
    private readonly findPlantById: FindPlantByIdUseCase,
    @Inject(FIND_ALL_AVAILABLE_PLANTS_USECASE)
    private readonly findAllAvailablePlants: FindAllAvailablePlantsUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get plant structure',
    description: 'Retrieves the complete structure of a plant including rooms and devices.',
  })
  @ApiQuery({
    name: 'plantid',
    required: true,
    type: String,
    description: 'Plant ID',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiOkResponse({
    description: 'Plant structure successfully retrieved.',
    type: PlantDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async findById(@Query('plantid') plantId: string) {
    try {
      const findByPlantIdCmd: FindPlantByIdCmd = {
        id: plantId,
      };

      const plant: Plant = await this.findPlantById.findById(findByPlantIdCmd);
      return PlantDto.fromDomain(plant);
    } catch {
      throw new NotFoundException();
    }
  }

  @Get('available')
  @ApiOperation({
    summary: 'Get available plants',
    description: 'Retrieves all plants available to the current user.',
  })
  @ApiOkResponse({
    description: 'Available plants successfully retrieved.',
    type: PlantDto,
    isArray: true,
  })
  async getAllAvailablePlants() {
    try {
      const plants: Plant[] =
        await this.findAllAvailablePlants.findAllAvailablePlants();

      const plantsDto: PlantDto[] = plants.map((plant: Plant) =>
        PlantDto.fromDomain(plant),
      );
      return plantsDto;
    } catch {
      return { message: 'No available plants found', statusCode: 202 };
    }
  }
}
