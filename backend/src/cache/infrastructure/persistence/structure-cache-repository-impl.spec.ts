import { Test, TestingModule } from '@nestjs/testing';
import { StructureCacheImpl } from './structure-cache-repository-impl';
import { PG_POOL } from 'src/database/database.module';
import { Pool } from 'pg';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

describe('StructureCacheImpl', () => {
  let repository: StructureCacheImpl;
  let mockPool: Partial<Pool>;
  let mockClient: any;

  beforeEach(async () => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StructureCacheImpl, { provide: PG_POOL, useValue: mockPool }],
    }).compile();

    repository = module.get<StructureCacheImpl>(StructureCacheImpl);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('write', () => {
    it('should write plant to cache successfully', async () => {
      const mockPlant: PlantEntity = {
        cached_at: new Date(),
        id: 'plant-1',
        data: { name: 'Test Plant', rooms: [] },
        ward_id: 1,
      };

      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.write(mockPlant);

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO structure_cache'),
        ['plant-1', JSON.stringify({ name: 'Test Plant', rooms: [] }), 1],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle on conflict update', async () => {
      const mockPlant: PlantEntity = {
        cached_at: new Date(),
        id: 'plant-1',
        data: { name: 'Test Plant', rooms: [] },
        ward_id: 1,
      };

      mockClient.query.mockResolvedValueOnce({ rows: [] });

      await repository.write(mockPlant);

      const query = (mockClient.query as jest.Mock).mock.calls[0][0];
      expect(query).toContain('ON CONFLICT (plant_id)');
      expect(query).toContain('DO UPDATE');
      expect(query).toContain('ward_id   = EXCLUDED.ward_id');
    });

    it('should handle write errors', async () => {
      const mockPlant: PlantEntity = {
        cached_at: new Date(),
        id: 'plant-1',
        data: { name: 'Test Plant', rooms: [] },
        ward_id: 1,
      };

      mockClient.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await repository.write(mockPlant);

      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle connection errors', async () => {
      const mockPlant: PlantEntity = {
        cached_at: new Date(),
        id: 'plant-1',
        data: { name: 'Test Plant', rooms: [] },
        ward_id: 1,
      };

      (mockPool.connect as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed'),
      );

      await expect(repository.write(mockPlant)).rejects.toThrow(
        'Connection failed',
      );
    });

    it('should release connection on error', async () => {
      const mockPlant: PlantEntity = {
        cached_at: new Date(),
        id: 'plant-1',
        data: { name: 'Test Plant', rooms: [] },
        ward_id: 1,
      };

      mockClient.query.mockRejectedValueOnce(new Error('Database error'));

      await repository.write(mockPlant);

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle null ward_id', async () => {
      const mockPlant: PlantEntity = {
        cached_at: new Date(),
        id: 'plant-1',
        data: { name: 'Test Plant', rooms: [] },
        ward_id: 0,
      };

      mockClient.query.mockResolvedValueOnce({ rows: [] });

      await repository.write(mockPlant);

      expect(mockClient.query).toHaveBeenCalledWith(expect.any(String), [
        'plant-1',
        JSON.stringify({ name: 'Test Plant', rooms: [] }),
        0,
      ]);
    });

    it('should convert plant data to JSON', async () => {
      const mockPlant: PlantEntity = {
        cached_at: new Date(),
        id: 'plant-1',
        data: {
          name: 'Test Plant',
          rooms: [
            { id: 'room-1', name: 'Living Room', devices: [] },
            { id: 'room-2', name: 'Kitchen', devices: [] },
          ],
        },
        ward_id: 1,
      };

      mockClient.query.mockResolvedValueOnce({ rows: [] });

      await repository.write(mockPlant);

      const params = (mockClient.query as jest.Mock).mock.calls[0][1];
      expect(params[1]).toBe(
        JSON.stringify({
          name: 'Test Plant',
          rooms: [
            { id: 'room-1', name: 'Living Room', devices: [] },
            { id: 'room-2', name: 'Kitchen', devices: [] },
          ],
        }),
      );
    });
  });
});
