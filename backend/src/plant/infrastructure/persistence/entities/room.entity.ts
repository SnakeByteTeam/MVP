import { Room } from 'src/plant/domain/models/room.model';
import { DeviceEntity } from 'src/device/infrastructure/entities/device.entity';

export class RoomEntity {
  id: string;
  name: string;
  devices: DeviceEntity[];

  static toDomain(entity: RoomEntity): Room {
    const devices = entity.devices.map((device) =>
      DeviceEntity.toDomain(device),
    );
    return new Room(entity.id, entity.name, devices);
  }

  static fromDomain(room: Room): RoomEntity {
    const entity = new RoomEntity();
    entity.id = room.getId();
    entity.name = room.getName();
    entity.devices = room
      .getDevices()
      .map((device) => DeviceEntity.fromDomain(device));
    return entity;
  }
}
