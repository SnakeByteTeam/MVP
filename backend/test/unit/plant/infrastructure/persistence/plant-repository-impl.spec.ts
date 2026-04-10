import { PlantRepositoryImpl } from 'src/plant/infrastructure/persistence/plant-repository-impl';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

describe('PlantRepositoryImpl', () => {
  let repository: PlantRepositoryImpl;
  let mockClient: any;
  let mockPool: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
    };

    repository = new PlantRepositoryImpl(mockPool);
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
      mockClient.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(repository.findById('plant-1')).rejects.toThrow(
        'Database error',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      mockPool.connect.mockRejectedValueOnce(new Error('Connection failed'));

      await expect(repository.findById('plant-1')).rejects.toThrow(
        'Connection failed',
      );
    });

    it('should release connection even on error', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Query failed'));

      try {
        await repository.findById('plant-1');
      } catch (e) {
        // Expected error
      }

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findAllAvailablePlants', () => {
    it('should find all available plants', async () => {
      const mockRows: PlantEntity[] = [
        {
          id: 'plant-1',
          cached_at: new Date(),
          ward_id: 0,
          data: { name: 'Plant A', rooms: [] },
        },
        {
          id: 'plant-2',
          cached_at: new Date(),
          ward_id: 0,
          data: { name: 'Plant B', rooms: [] },
        },
      ];

      mockClient.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repository.findAllAvailablePlants();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE ward_id IS NULL'),
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockRows);
      expect(result).toHaveLength(2);
    });

    it('should return null when no available plants found', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findAllAvailablePlants();

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return only plants with ward_id IS NULL', async () => {
      const mockRow: PlantEntity = {
        id: 'plant-1',
        cached_at: new Date(),
        ward_id: 0,
        data: { name: 'Available Plant', rooms: [] },
      };

      mockClient.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await repository.findAllAvailablePlants();

      expect(result?.[0].ward_id).toBe(0);
      expect(result?.length).toBe(1);
    });

    it('should handle database query errors on findAllAvailablePlants', async () => {
      mockClient.query.mockRejectedValueOnce(
        new Error('Database error on select all'),
      );

      await expect(repository.findAllAvailablePlants()).rejects.toThrow(
        'Database error on select all',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release connection even on findAllAvailablePlants error', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Query failed'));

      try {
        await repository.findAllAvailablePlants();
      } catch (e) {
        // Expected error
      }

      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('findAllPlants', () => {
    it('should return all plants', async () => {
      const mockRows: PlantEntity[] = [
        {
          id: 'plant-1',
          cached_at: new Date(),
          ward_id: 1,
          data: { name: 'Plant A', rooms: [] },
        },
        {
          id: 'plant-2',
          cached_at: new Date(),
          ward_id: null,
          data: { name: 'Plant B', rooms: [] },
        },
      ];

      mockClient.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await repository.findAllPlants();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM plant'),
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockRows);
    });

    it('should return null when there are no plants', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findAllPlants();

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release connection when findAllPlants fails', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Query failed'));

      await expect(repository.findAllPlants()).rejects.toThrow('Query failed');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
