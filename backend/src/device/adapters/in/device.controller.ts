import {
  Controller,
  Query,
  Get,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
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

@Controller('device')
export class DeviceController {
  constructor(
    @Inject(FIND_DEVICE_BY_ID_USECASE)
    private readonly findByIdUseCase: FindDeviceByIdUseCase,
    @Inject(FIND_DEVICE_BY_PLANTID_USECASE)
    private readonly findByPlantIdUseCase: FindDeviceByPlantIdUseCase,
  ) {}

  @Get('id')
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
