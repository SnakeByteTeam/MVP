import {
  Controller,
  Get,
  Param,
  Inject,
  InternalServerErrorException,
  HttpCode,
  Post,
  Body,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  NotificationDataDto,
  SubNotificationPayloadDto,
} from 'src/cache/infrastructure/http/dtos/in/subNotification.dto';
import { FindDeviceByIdCmd } from 'src/device/application/commands/find-device-by-id.command';
import { FindDeviceByPlantIdCmd } from 'src/device/application/commands/find-device-by-plantid.command';
import { IngestTimeseriesCmd } from 'src/device/application/commands/ingest-timeseries.command';
import { WriteDatapointValueCmd } from 'src/device/application/commands/write-datapoint-value.command';
import {
  type FindDeviceByIdUseCase,
  FIND_DEVICE_BY_ID_USECASE,
} from 'src/device/application/ports/in/find-device-by-id.usecase';
import {
  type FindDeviceByPlantIdUseCase,
  FIND_DEVICE_BY_PLANTID_USECASE,
} from 'src/device/application/ports/in/find-device-by-plantid.usecase';
import {
  GET_DEVICE_VALUE_USECASE,
  GetDeviceValueUseCase,
} from 'src/device/application/ports/in/get-device-value.usecase';
import {
  INGEST_TIMESERIES_USE_CASE,
  type IngestTimeseriesUseCase,
} from 'src/device/application/ports/in/ingest-timeseris.usecase';
import { WRITE_DATAPOINT_VALUE_USECASE, WriteDatapointValueUseCase } from 'src/device/application/ports/in/write-datapoint-value.usecase';
import { DeviceValue } from 'src/device/domain/models/device-value.model';
import { Device } from 'src/device/domain/models/device.model';
import { WriteDatapointDto } from 'src/device/infrastructure/http/dtos/in/write-datapoint-value.dto';
import { DeviceValueDto } from 'src/device/infrastructure/http/dtos/out/device-value.dto';
import { DeviceDto } from 'src/device/infrastructure/http/dtos/out/device.dto';

@ApiTags('device')
@Controller('/device')
export class DeviceController {
  constructor(
    @Inject(FIND_DEVICE_BY_ID_USECASE)
    private readonly findByIdUseCase: FindDeviceByIdUseCase,
    @Inject(FIND_DEVICE_BY_PLANTID_USECASE)
    private readonly findByPlantIdUseCase: FindDeviceByPlantIdUseCase,
    @Inject(INGEST_TIMESERIES_USE_CASE)
    private readonly ingestTimeseries: IngestTimeseriesUseCase,
    @Inject(GET_DEVICE_VALUE_USECASE)
    private readonly getDeviceValueUseCase: GetDeviceValueUseCase,
    @Inject(WRITE_DATAPOINT_VALUE_USECASE)
    private readonly writeDatapointUseCase: WriteDatapointValueUseCase
  ) {}

  @Get('/:id')
  @ApiOperation({
    summary: 'Get device by ID',
    description: 'Retrieves a specific device by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'Device ID',
    example: 'fct-012923FAB00624-1090564616',
  })
  @ApiOkResponse({
    description: 'Device successfully retrieved.',
    type: DeviceDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async findById(@Param('id') deviceId: string): Promise<DeviceDto> {
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

  @Post('')
  async writeDatapointValue(@Body() req: WriteDatapointDto) {
    if(!req.datapointId || !req.value) throw new BadRequestException;

    try {
      const cmd: WriteDatapointValueCmd = {
        datapointId: req.datapointId,
        value: req.value
      }

      await this.writeDatapointUseCase.writeDatapointValue(cmd);
    } catch {

    }
  }

  @Get('/plant/:plantId')
  @ApiOperation({
    summary: 'Get devices by plant ID',
    description: 'Retrieves all devices associated with a specific plant.',
  })
  @ApiParam({
    name: 'plantId',
    required: true,
    type: String,
    description: 'Plant ID',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @ApiOkResponse({
    description: 'Devices successfully retrieved.',
    type: DeviceDto,
    isArray: true,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async findByPlantId(@Param('plantId') plantId: string): Promise<DeviceDto[]> {
    if(!plantId) throw BadRequestException;
    
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

  @Post('update')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Update datapoint values',
    description: 'Processes datapoint updates from webhook notifications.',
  })
  @ApiOkResponse({
    description: 'Update accepted. Processing in background.',
    schema: {
      example: {
        message: 'Datapoints updated received',
        statusCode: 202,
      },
    },
  })
  async onDatapointUpdate(
    @Body() payload: SubNotificationPayloadDto,
  ): Promise<{ message: string; statusCode: number }> {
    const ingestCmds: IngestTimeseriesCmd[] = payload.data
      .filter((item: NotificationDataDto) => item.type === 'datapoint')
      .map((item: NotificationDataDto) => ({
        datapointId: item.id,
        value: item.attributes.value as string,
        timestamp: item.attributes.timestamp as string,
      }));

    setImmediate(async () => {
      for (const cmd of ingestCmds) {
        try {
          console.log(
            `[DeviceController] Starting ingestion for ${cmd.datapointId}`,
          );
          await this.ingestTimeseries.ingestTimeseries(cmd);
          console.log(
            `[DeviceController] Ingestion ended successfully for ${cmd.datapointId}`,
          );
        } catch (err) {
          console.error(
            `[DeviceController] Error ingesting for ${cmd.datapointId}:`,
            err.message,
          );
        }
      }
    });

    return { message: 'Datapoints updated received', statusCode: 200 };
  }

  @Get(':deviceId/value')
  @ApiOperation({
    summary: 'Get device value',
    description: 'Retrieves the current value of a specific device.',
  })
  @ApiParam({
    name: 'deviceId',
    required: true,
    type: String,
    description: 'Device ID',
    example: 'fct-012923FAB00624-1090564616',
  })
  @ApiOkResponse({
    description: 'Device value successfully retrieved.',
    type: DeviceValueDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  async getDeviceValue(@Param('deviceId') deviceId: string): Promise<any> {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }

    try {
      const value: DeviceValue =
        await this.getDeviceValueUseCase.getDeviceValue({ deviceId: deviceId });
      return DeviceValueDto.fromDomain(value);
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
