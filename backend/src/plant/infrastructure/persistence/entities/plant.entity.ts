import { Plant } from 'src/plant/domain/models/plant.model';
import { RoomEntity } from '../../../../cache/infrastructure/persistence/entities/room.entity';

export class PlantEntity {
  cached_at!: Date;
  id!: string;
  data: {
    name: string;
    rooms: RoomEntity[];
  } = {
    name: '',
    rooms: [],
  };
  ward_id!: number | null;

  static toDomain(entity: PlantEntity): Plant {
    const rooms = (entity.data.rooms ?? []).map((room) => RoomEntity.toDomain(room));
    const wardId = entity.ward_id ?? undefined;

    return new Plant(entity.id, entity.data.name, rooms, wardId);
  }

  static fromDomain(plant: Plant): PlantEntity {
    const entity = new PlantEntity();
    entity.cached_at = new Date(Date.now());
    entity.id = plant.getId();

    const rooms = plant.getRooms();
    entity.data = {
      name: plant.getName(),
      rooms: (rooms ?? []).map((room) => RoomEntity.fromDomain(room)),
    };

    const wardId = plant.getWardId();
    entity.ward_id = wardId === null ? null : wardId;

    return entity;
  }
}
