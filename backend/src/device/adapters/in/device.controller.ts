import {
  Controller,
  Get,
  Param,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';
import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';
import {
  type FindDeviceByIdUseCase,
  FIND_DEVICE_BY_ID_USECASE,
} from 'src/device/application/ports/in/find-device-by-id.usecase';
import {
  type FindDeviceByPlantIdUseCase,
  FIND_DEVICE_BY_PLANTID_USECASE,
} from 'src/device/application/ports/in/find-device-by-plantid.usecase';
import { Device } from 'src/device/domain/models/device.model';
import { DeviceDto } from 'src/device/infrastructure/http/dtos/device.dto';

@ApiTags('device')
@Controller(':plantId/device')
export class DeviceController {
  constructor(
    @Inject(FIND_DEVICE_BY_ID_USECASE)
    private readonly findByIdUseCase: FindDeviceByIdUseCase,
    @Inject(FIND_DEVICE_BY_PLANTID_USECASE)
    private readonly findByPlantIdUseCase: FindDeviceByPlantIdUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single device by ID',
    description:
      'Retrieves a specific device within a plant by its unique identifier.',
  })
  @ApiParam({
    name: 'plantId',
    required: true,
    type: String,
    description: 'Unique identifier of the plant.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'Unique identifier of the device.',
    example: 'fct-012923FAB00624-1090564616',
  })
  @ApiOkResponse({
    description: 'Device successfully retrieved.',
    type: DeviceDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error while retrieving the device.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  async findById(
    @Param('plantId') plantId: string,
    @Param('id') deviceId: string,
  ): Promise<DeviceDto> {
    const findByIdCmd: FindDeviceByIdCmd = {
      id: deviceId,
    };

    try {
      const device: Device = await this.findByIdUseCase.findById(findByIdCmd);
      return DeviceDto.fromDomain(device);
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Get('')
  @ApiOperation({
    summary: 'Get all devices for a plant',
    description: 'Retrieves all devices within a specific plant.',
  })
  @ApiParam({
    name: 'plantId',
    required: true,
    type: String,
    description: 'Unique identifier of the plant.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiOkResponse({
    description: 'List of devices successfully retrieved.',
    type: DeviceDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error while retrieving plant devices.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  async findByPlantId(@Param('plantId') plantId: string): Promise<DeviceDto[]> {
    const findByPlantIdCmd: FindDeviceByPlantIdCmd = {
      id: plantId,
    };

    try {
      const devices: Device[] =
        await this.findByPlantIdUseCase.findByPlantId(findByPlantIdCmd);
      return devices.map((device) => DeviceDto.fromDomain(device));
    } catch {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Get('update')
  async onDatapointUpdate(): Promise<{message: string, statusCode: number}> {
    

    return { message: 'Datapoint updated successfully', statusCode: 200 };
  }

}
