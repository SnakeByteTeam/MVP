import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';
import { RoomDto } from 'src/plant/infrastructure/http/dtos/room.dto';

describe('PlantDto', () => {
  describe('toDomain', () => {
    it('should convert PlantDto to Plant domain model', () => {
      const roomDto = new RoomDto();
      roomDto.id = 'room-1';
      roomDto.name = 'Living Room';
      roomDto.devices = [];

      const dto = new PlantDto();
      dto.id = 'plant-1';
      dto.name = 'My Plant';
      dto.rooms = [roomDto];
      dto.wardId = 1;

      const plant = PlantDto.toDomain(dto);

      expect(plant).toBeInstanceOf(Plant);
      expect(plant.getId()).toBe('plant-1');
      expect(plant.getName()).toBe('My Plant');
      expect(plant.getRooms()).toHaveLength(1);
      expect(plant.getWardId()).toBe(1);
    });

    it('should default to empty rooms when dto.rooms is undefined', () => {
      const dto = new PlantDto();
      dto.id = 'plant-2';
      dto.name = 'Plant Without Rooms';

      const plant = PlantDto.toDomain(dto);

      expect(plant.getRooms()).toEqual([]);
    });
  });

  describe('fromDomain', () => {
    it('should convert Plant domain model to PlantDto', () => {
      const room = new Room('room-1', 'Living Room', []);
      const plant = new Plant('plant-3', 'Mapped Plant', [room], 7);

      const dto = PlantDto.fromDomain(plant);

      expect(dto).toBeInstanceOf(PlantDto);
      expect(dto.id).toBe('plant-3');
      expect(dto.name).toBe('Mapped Plant');
      expect(dto.rooms).toHaveLength(1);
      expect(dto.rooms?.[0]?.id).toBe('room-1');
      expect(dto.wardId).toBe(7);
    });

    it('should map missing rooms and wardId to optional dto fields', () => {
      const plant = new Plant('plant-4', 'Simple Plant');

      const dto = PlantDto.fromDomain(plant);

      expect(dto.id).toBe('plant-4');
      expect(dto.name).toBe('Simple Plant');
      expect(dto.rooms).toEqual([]);
      expect(dto.wardId).toBeUndefined();
    });

    it('should keep wardId undefined when domain wardId is 0 in current model behavior', () => {
      const plant = new Plant('plant-5', 'Zero Ward Plant', [], 0);

      const dto = PlantDto.fromDomain(plant);

      expect(dto.wardId).toBeUndefined();
    });
  });
});
