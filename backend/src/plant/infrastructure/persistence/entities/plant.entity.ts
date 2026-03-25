import { Plant } from "src/plant/domain/models/plant.model";
import { RoomEntity } from "./room.entity";

export class PlantEntity {
    cached_at: Date;
    data: {
        id: string;
        name: string;
        rooms: RoomEntity[];
  };

  static toDomain(entity: PlantEntity): Plant {
    const rooms = entity.data.rooms.map((room) => RoomEntity.toDomain(room));
    return new Plant(entity.data.id, entity.data.name, rooms, entity.cached_at);
  }

  static fromDomain(plant: Plant): PlantEntity {
    const entity = new PlantEntity();
    entity.cached_at = plant.getCachedAt();
    entity.data = {
      id: plant.getId(),
      name: plant.getName(),
      rooms: plant.getRooms().map((room) => RoomEntity.fromDomain(room)),
    };
    return entity;
  }
}