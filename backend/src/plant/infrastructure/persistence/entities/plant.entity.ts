import { Plant } from 'src/plant/domain/models/plant.model';
import { RoomEntity } from '../../../../cache/infrastructure/persistence/entities/room.entity';

export class PlantEntity {
  cached_at: Date;
  id: string;
  data: {
    name: string;
    rooms: RoomEntity[];
  };
  ward_id: number;

  static toDomain(entity: PlantEntity): Plant {
    const rooms = entity.data.rooms.map((room) => RoomEntity.toDomain(room));
    return new Plant(entity.id, entity.data.name, rooms, entity.ward_id);
  }

  static fromDomain(plant: Plant): PlantEntity {
    const entity = new PlantEntity();
    entity.cached_at = new Date(Date.now());
    entity.id = plant.getId();
    entity.data = {
      name: plant.getName(),
      rooms: plant.getRooms().map((room) => RoomEntity.fromDomain(room)),
    };
    entity.ward_id = plant.getWardId();
    return entity;
  }
}
