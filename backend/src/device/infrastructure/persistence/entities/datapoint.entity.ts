import { Datapoint } from 'src/device/domain/models/datapoint.model';

export class DatapointEntity {
  id: string;
  name: string;
  readable: boolean;
  writable: boolean;
  valueType: string;
  enum: string[];
  sfeType: string;

  static toDomain(entity: DatapointEntity): Datapoint {
    const enumValues = Array.isArray(entity.enum) ? entity.enum : [];
    return new Datapoint(
      entity.id,
      entity.name,
      entity.readable,
      entity.writable,
      entity.valueType,
      enumValues,
      entity.sfeType,
    );
  }

  static fromDomain(datapoint: Datapoint): DatapointEntity {
    const entity = new DatapointEntity();
    entity.id = datapoint.getId();
    entity.name = datapoint.getName();
    entity.readable = datapoint.isReadable();
    entity.writable = datapoint.isWritable();
    entity.valueType = datapoint.getValueType();
    entity.enum = datapoint.getEnum();
    entity.sfeType = datapoint.getSfeType();
    return entity;
  }
}
