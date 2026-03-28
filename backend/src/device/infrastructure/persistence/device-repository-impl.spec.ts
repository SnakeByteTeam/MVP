import { Test, TestingModule } from '@nestjs/testing';
import { DeviceRepositoryImpl } from './device-repository-impl';
import { PG_POOL } from 'src/database/database.module';
import { Pool } from 'pg';
import { DeviceEntity } from './entities/device.entity';

describe('DeviceRepositoryImpl', () => {
  let repository: DeviceRepositoryImpl;
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
        DeviceRepositoryImpl,
        { provide: PG_POOL, useValue: mockPool },
      ],
    }).compile();

    repository = module.get<DeviceRepositoryImpl>(DeviceRepositoryImpl);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should find device by id', async () => {
      const mockDevice: DeviceEntity = {
        id: 'device-1',
        name: 'Test Device',
        plantId: 'plant-1',
        type: 'light',
        subType: 'smart-light',
        datapoints: [],
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [{ device: mockDevice }],
      });

      const result = await repository.findById('device-1');

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('jsonb_path_query'),
        ['device-1'],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockDevice);
    });

    it('should return null when device not found', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Query failed'));

      await expect(repository.findById('device-1')).rejects.toThrow(
        'Database error: Query failed',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release connection on error', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Query failed'));

      try {
        await repository.findById('device-1');
      } catch (e) {
        // Expected
      }

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle null device in result', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [{ device: null }] });

      const result = await repository.findById('device-1');

      expect(result).toBeNull();
    });

    it('should extract device from jsonb_path_query result', async () => {
      const mockDevice: DeviceEntity = {
        id: 'device-1',
        name: 'Smart Light',
        plantId: 'plant-1',
        type: 'light',
        subType: 'smart-light',
        datapoints: [],
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [{ device: mockDevice }],
      });

      const result = await repository.findById('device-1');

      expect(result?.id).toBe('device-1');
      expect(result?.name).toBe('Smart Light');
      expect(result?.type).toBe('light');
    });
  });

  describe('findByPlantId', () => {
    it('should find all devices by plant id', async () => {
      const mockDevices: DeviceEntity[] = [
        {
          id: 'device-1',
          name: 'Light 1',
          plantId: 'plant-1',
          type: 'light',
          subType: 'smart-light',
          datapoints: [],
        },
        {
          id: 'device-2',
          name: 'Thermostat',
          plantId: 'plant-1',
          type: 'thermostat',
          subType: 'smart-thermostat',
          datapoints: [],
        },
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: [{ device: mockDevices[0] }, { device: mockDevices[1] }],
      });

      const result = await repository.findByPlantId('plant-1');

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('jsonb_path_query'),
        ['plant-1'],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result?.[0]?.id).toBe('device-1');
      expect(result?.[1]?.id).toBe('device-2');
    });

    it('should return null when no devices found', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByPlantId('plant-1');

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle empty device array', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByPlantId('plant-1');

      expect(result).toBeNull();
    });

    it('should map all devices from query result', async () => {
      const mockDevices: DeviceEntity[] = [
        {
          id: 'device-1',
          name: 'Device 1',
          plantId: 'plant-1',
          type: 'light',
          subType: 'smart-light',
          datapoints: [],
        },
        {
          id: 'device-2',
          name: 'Device 2',
          plantId: 'plant-1',
          type: 'light',
          subType: 'smart-light',
          datapoints: [],
        },
        {
          id: 'device-3',
          name: 'Device 3',
          plantId: 'plant-1',
          type: 'thermostat',
          subType: 'smart-thermostat',
          datapoints: [],
        },
      ];

      mockClient.query.mockResolvedValueOnce({
        rows: mockDevices.map((d) => ({ device: d })),
      });

      const result = await repository.findByPlantId('plant-1');

      expect(result).toHaveLength(3);
      expect(result?.map((d) => d.id)).toEqual([
        'device-1',
        'device-2',
        'device-3',
      ]);
    });

    it('should handle database errors', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Connection lost'));

      await expect(repository.findByPlantId('plant-1')).rejects.toThrow(
        'Database error: Connection lost',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release connection on error', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Query failed'));

      try {
        await repository.findByPlantId('plant-1');
      } catch (e) {
        // Expected
      }

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      (mockPool.connect as jest.Mock).mockRejectedValueOnce(
        new Error('Pool error'),
      );

      await expect(repository.findByPlantId('plant-1')).rejects.toThrow(
        'Pool error',
      );
    });

    it('should query correct table and column', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      await repository.findByPlantId('plant-1');

      const query = (mockClient.query as jest.Mock).mock.calls[0][0];
      expect(query).toContain('structure_cache');
      expect(query).toContain('plant_id');
    });
  });
});
