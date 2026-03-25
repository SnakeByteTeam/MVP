import {
  Controller,
  Query,
  Get,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
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
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { Device } from 'src/device/domain/models/device.model';
import { DatapointDto } from 'src/device/infrastructure/dtos/datapoint.dto';
import { DeviceDto } from 'src/device/infrastructure/dtos/device.dto';

@ApiTags('device')
@Controller('device')
export class DeviceController {
  constructor(
    @Inject(FIND_DEVICE_BY_ID_USECASE)
    private readonly findByIdUseCase: FindDeviceByIdUseCase,
    @Inject(FIND_DEVICE_BY_PLANTID_USECASE)
    private readonly findByPlantIdUseCase: FindDeviceByPlantIdUseCase,
  ) {}

  @Get('id')
  @ApiOperation({
    summary: 'Get device by id',
    description:
      'Expected query parameter: deviceId. Returned payload: one DeviceDto.',
  })
  @ApiQuery({
    name: 'deviceId',
    required: true,
    type: String,
    description: 'Unique identifier of the device.',
    example: 'fct-012923FAB00624-1090564616',
  })
  @ApiOkResponse({
    description: 'Device found and returned.',
    type: DeviceDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error while reading device information.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  async findById(@Query('deviceId') deviceId: string): Promise<DeviceDto> {
    const findByIdCmd: FindDeviceByIdCmd = {
      id: deviceId,
    };

    try {
      const device: Device = await this.findByIdUseCase.findById(findByIdCmd);
      return this.deviceToDto(device);
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Get('plantId')
  @ApiOperation({
    summary: 'Get all devices by plant id',
    description:
      'Expected query parameter: plantId. Returned payload: list of DeviceDto.',
  })
  @ApiQuery({
    name: 'plantId',
    required: true,
    type: String,
    description: 'Unique identifier of the plant.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiOkResponse({
    description: 'Devices found and returned.',
    type: DeviceDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected error while reading plant devices.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      },
    },
  })
  async findByPlantId(@Query('plantId') plantId: string): Promise<DeviceDto[]> {
    const findByPlantIdCmd: FindDeviceByPlantIdCmd = {
      id: plantId,
    };

    try {
      const devices: Device[] =
        await this.findByPlantIdUseCase.findByPlantId(findByPlantIdCmd);
      return devices.map((device) => this.deviceToDto(device));
    } catch (err) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  private deviceToDto(device: Device): DeviceDto {
    const datapointsDto: DatapointDto[] = device
      .getDatapoints()
      .map((dp) => this.datapointToDto(dp));

    const deviceDto: DeviceDto = {
      id: device.getId(),
      name: device.getName(),
      plantId: device.getPlantId(),
      type: device.getType(),
      subType: device.getSubType(),
      datapoints: datapointsDto,
    };

    return deviceDto;
  }

  private datapointToDto(datapoint: Datapoint): DatapointDto {
    const datapointDto: DatapointDto = {
      id: datapoint.getId(),
      name: datapoint.getName(),
      readable: datapoint.isReadable(),
      writable: datapoint.isWritable(),
      valueType: datapoint.getValueType(),
      enum: datapoint.getEnum(),
      sfeType: datapoint.getSfeType(),
    };

    return datapointDto;
  }
}
