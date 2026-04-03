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
      expect(query).toContain('plant');
      expect(query).toContain('id');
    });
  });

  describe('ingestTimeseries', () => {
    it('should successfully ingest datapoint with valid parameters', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await repository.ingestTimeseries(
        'dp-123',
        '25.5',
        '2026-04-01T13:41:58Z',
      );

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO datapoint_history'),
        ['2026-04-01T13:41:58Z', 'dp-123', '25.5'],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true when ON CONFLICT update succeeds', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await repository.ingestTimeseries(
        'dp-123',
        '26.0',
        '2026-04-01T13:41:58Z',
      );

      expect(result).toBe(true);
    });

    it('should return false when rowCount is 0', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 0 });

      const result = await repository.ingestTimeseries(
        'dp-123',
        '25.5',
        '2026-04-01T13:41:58Z',
      );

      expect(result).toBe(false);
    });

    it('should use correct parameter order: timestamp, datapointId, value', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      await repository.ingestTimeseries(
        'dp-test',
        'test-value',
        'test-timestamp',
      );

      const calls = (mockClient.query as jest.Mock).mock.calls;
      expect(calls[0][1]).toEqual(['test-timestamp', 'dp-test', 'test-value']);
    });

    it('should cast parameters to correct types', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      await repository.ingestTimeseries(
        'dp-123',
        '99.99',
        '2026-04-01T15:00:00Z',
      );

      const query = (mockClient.query as jest.Mock).mock.calls[0][0];
      expect(query).toContain('TIMESTAMPTZ');
      expect(query).toContain('TEXT');
    });

    it('should handle ON CONFLICT DO UPDATE clause', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      await repository.ingestTimeseries(
        'dp-123',
        '25.5',
        '2026-04-01T13:41:58Z',
      );

      const query = (mockClient.query as jest.Mock).mock.calls[0][0];
      expect(query).toContain('ON CONFLICT');
      expect(query).toContain('DO UPDATE');
    });

    it('should handle database errors', async () => {
      mockClient.query.mockRejectedValueOnce(
        new Error('Unique constraint violation'),
      );

      await expect(
        repository.ingestTimeseries('dp-123', '25.5', '2026-04-01T13:41:58Z'),
      ).rejects.toThrow('Database error: Unique constraint violation');
    });

    it('should release connection on error', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Query failed'));

      try {
        await repository.ingestTimeseries(
          'dp-123',
          '25.5',
          '2026-04-01T13:41:58Z',
        );
      } catch (e) {
        // Expected
      }

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle connection pool errors', async () => {
      (mockPool.connect as jest.Mock).mockRejectedValueOnce(
        new Error('Connection timeout'),
      );

      await expect(
        repository.ingestTimeseries('dp-123', '25.5', '2026-04-01T13:41:58Z'),
      ).rejects.toThrow('Connection timeout');
    });

    it('should handle timestamps in ISO 8601 format', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      const isoTimestamp = '2026-04-01T13:41:58.123Z';
      await repository.ingestTimeseries('dp-123', '25.5', isoTimestamp);

      const params = (mockClient.query as jest.Mock).mock.calls[0][1];
      expect(params[0]).toBe(isoTimestamp);
    });

    it('should handle numeric values as strings', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await repository.ingestTimeseries(
        'dp-123',
        '123.456',
        '2026-04-01T13:41:58Z',
      );

      expect(result).toBe(true);
    });

    it('should handle special characters in datapointId', async () => {
      mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

      await repository.ingestTimeseries(
        'fct-012923FAB00624-1090564616',
        '25.5',
        '2026-04-01T13:41:58Z',
      );

      const params = (mockClient.query as jest.Mock).mock.calls[0][1];
      expect(params[1]).toBe('fct-012923FAB00624-1090564616');
    });
  });

  describe('findByDatapointId', () => {
    it('should return a device when datapoint exists', async () => {
      const mockDevice: DeviceEntity = {
        id: 'device-1',
        name: 'Switch',
        plantId: 'plant-1',
        type: 'light',
        subType: 'switch',
        datapoints: [],
      };

      mockClient.query.mockResolvedValueOnce({
        rows: [{ device: mockDevice }],
      });

      const result = await repository.findByDatapointId('dp-1');

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('jsonb_path_query'),
        ['dp-1'],
      );
      expect(result).toEqual(mockDevice);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should return null when datapoint is not found', async () => {
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await repository.findByDatapointId('dp-missing');

      expect(result).toBeNull();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw wrapped database error', async () => {
      mockClient.query.mockRejectedValueOnce(new Error('Query failed'));

      await expect(repository.findByDatapointId('dp-1')).rejects.toThrow(
        'Database error: Query failed',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
