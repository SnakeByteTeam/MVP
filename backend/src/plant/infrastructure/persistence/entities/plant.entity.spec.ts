import { Plant } from 'src/plant/domain/models/plant.model';
import { Room } from 'src/plant/domain/models/room.model';
import { PlantEntity } from './plant.entity';

describe('PlantEntity', () => {
  describe('toDomain', () => {
    it('should convert PlantEntity to Plant domain model', () => {
      const entity = new PlantEntity();
      entity.id = 'plant-1';
      entity.cached_at = new Date('2026-03-25T10:00:00.000Z');
      entity.ward_id = 2;
      entity.data = {
        name: 'Entity Plant',
        rooms: [],
      };

      const plant = PlantEntity.toDomain(entity);

      expect(plant).toBeInstanceOf(Plant);
      expect(plant.getId()).toBe('plant-1');
      expect(plant.getName()).toBe('Entity Plant');
      expect(plant.getRooms()).toEqual([]);
      expect(plant.getWardId()).toBe(2);
    });

    it('should handle null ward_id and undefined rooms safely', () => {
      const entity = new PlantEntity();
      entity.id = 'plant-2';
      entity.cached_at = new Date('2026-03-25T10:00:00.000Z');
      entity.ward_id = null;
      entity.data = {
        name: 'Nullable Entity Plant',
        rooms: undefined as any,
      };

      const plant = PlantEntity.toDomain(entity);

      expect(plant.getRooms()).toEqual([]);
      expect(plant.getWardId()).toBeNull();
    });
  });

  describe('fromDomain', () => {
    it('should convert Plant domain model to PlantEntity', () => {
      const room = new Room('room-1', 'Living Room', []);
      const plant = new Plant('plant-3', 'Domain Plant', [room], 9);

      const entity = PlantEntity.fromDomain(plant);

      expect(entity.id).toBe('plant-3');
      expect(entity.data.name).toBe('Domain Plant');
      expect(entity.data.rooms).toHaveLength(1);
      expect(entity.data.rooms[0].id).toBe('room-1');
      expect(entity.ward_id).toBe(9);
      expect(entity.cached_at).toBeInstanceOf(Date);
    });

    it('should map missing rooms and wardId to safe defaults', () => {
      const plant = new Plant('plant-4', 'Domain Without Optional Data');

      const entity = PlantEntity.fromDomain(plant);

      expect(entity.data.rooms).toEqual([]);
      expect(entity.ward_id).toBeNull();
    });

    it('should map wardId 0 to null with current model behavior', () => {
      const plant = new Plant('plant-5', 'Zero Ward Domain', [], 0);

      const entity = PlantEntity.fromDomain(plant);

      expect(entity.ward_id).toBeNull();
    });
  });
});
