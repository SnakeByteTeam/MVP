import { Controller, Query, Get, Inject } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FindPlantByIdCmd } from 'src/plant/application/commands/find-plant-by-id.command';
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
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get plant structure by plant id',
    description:
      'Expected query parameter: plantid. Returned payload: one PlantDto.',
  })
  @ApiQuery({
    name: 'plantid',
    required: true,
    type: String,
    description: 'Unique identifier of the plant.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiOkResponse({
    description: 'Plant found and returned.',
    type: PlantDto,
  })
  @ApiInternalServerErrorResponse({
    description:
      'Unexpected error while reading/synchronizing plant structure.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  async findById(@Query('plantid') plantId: string) {
    const findByIdCmd: FindPlantByIdCmd = {
      id: plantId,
    };

    const plant: Plant = await this.findPlantById.findById(findByIdCmd);
    return PlantDto.fromDomain(plant);
  }
}
