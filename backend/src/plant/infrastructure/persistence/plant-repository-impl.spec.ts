import { Test, TestingModule } from '@nestjs/testing';
import { PlantRepositoryImpl } from './plant-repository-impl';
import { PG_POOL } from 'src/database/database.module';
import { Pool } from 'pg';
import { PlantEntity } from './entities/plant.entity';

describe('PlantRepositoryImpl', () => {
  let repository: PlantRepositoryImpl;
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
      providers: [
        PlantRepositoryImpl,
        { provide: PG_POOL, useValue: mockPool },
      ],
    }).compile();

    repository = module.get<PlantRepositoryImpl>(PlantRepositoryImpl);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find plant by id', async () => {
      const mockRow: PlantEntity = {
        id: 'plant-1',
        cached_at: new Date(),
        ward_id: 1,
        data: {
          name: 'Test Plant',
          rooms: [{ id: 'room-1', name: 'Living Room', devices: [] }],
        },
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repository.findById('plant-1');

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['plant-1'],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.id).toBe('plant-1');
    });

    it('should return null when plant not found', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should parse JSONB data correctly', async () => {
      const mockRow: PlantEntity = {
        id: 'plant-1',
        cached_at: new Date(),
        ward_id: 1,
        data: {
          name: 'Test Plant',
          rooms: [
            { id: 'room-1', name: 'Living Room', devices: [] },
            { id: 'room-2', name: 'Kitchen', devices: [] },
          ],
        },
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repository.findById('plant-1');

      expect(result?.data.name).toBe('Test Plant');
      expect(result?.data.rooms).toHaveLength(2);
      expect(result?.data.rooms[0].name).toBe('Living Room');
    });

    it('should handle string JSONB data', async () => {
      const mockRow: PlantEntity = {
        id: 'plant-1',
        cached_at: new Date(),
        ward_id: 1,
        data: { name: 'Test', rooms: [] },
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repository.findById('plant-1');

      expect(result?.data.name).toBe('Test');
      expect(result?.data.rooms).toEqual([]);
    });

    it('should handle database query errors', async () => {
      mockClient.query.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(repository.findById('plant-1')).rejects.toThrow(
        'Database error',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      (mockPool.connect as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed'),
      );

      await expect(repository.findById('plant-1')).rejects.toThrow(
        'Connection failed',
      );
    });

    it('should release connection even on error', async () => {
      mockClient.query.mockRejectedValueOnce(
        new Error('Query failed'),
      );

      try {
        await repository.findById('plant-1');
      } catch (e) {
        // Expected error
      }

      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
