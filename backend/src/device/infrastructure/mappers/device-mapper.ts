import { Device } from 'src/device/domain/models/device.model';
import { DeviceEntity } from '../entities/device.entity';
import { Datapoint } from 'src/device/domain/models/datapoint.model';
import { DatapointEntity } from '../entities/datapoint.entity';
import { DeviceMapperRepoPort } from 'src/device/application/repository/device-mapper.repository';

export class DeviceMapper implements DeviceMapperRepoPort {
  public toDomain(entity: DeviceEntity): Device {
    const datapoints: Datapoint[] = entity.datapoints.map((dp) =>
      this.datapointToDomain(dp),
    );
    return new Device(
      entity.id,
      entity.plantId,
      entity.name,
      entity.type,
      entity.subType,
      datapoints,
    );
  }

  private datapointToDomain(entity: DatapointEntity): Datapoint {
    return new Datapoint(
      entity.id,
      entity.name,
      entity.readable,
      entity.writable,
      entity.valueType,
      entity.enum,
      entity.sfeType,
    );
  }
}
