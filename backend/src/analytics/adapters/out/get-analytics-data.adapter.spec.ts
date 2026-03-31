import { Test, TestingModule } from '@nestjs/testing';
import { GetAnalyticsData } from './get-analytics-data.adapter';
import { GetAnalyticsRepositoryPort } from 'src/analytics/application/repository/get-analytics-repository.interface';
import { DatapointRow } from 'src/analytics/domain/datapoint-row.model';

const mockRepository: jest.Mocked<GetAnalyticsRepositoryPort> = {
  query: jest.fn(),
};

const startDate = new Date('2024-01-01T00:00:00.000Z');

const mockDatapointRows: DatapointRow[] = [
  {
    timestamp: '2024-01-01T08:00:00.000Z',
    datapoint_id: 'dp-001',
    value: '42.5',
    sfe_type: 'temperature',
    device_type: 'sensor',
  },
  {
    timestamp: '2024-01-01T08:00:00.000Z',
    datapoint_id: 'dp-002',
    value: '55.0',
    sfe_type: 'humidity',
    device_type: 'sensor',
  },
  {
    timestamp: '2024-01-01T09:00:00.000Z',
    datapoint_id: 'dp-003',
    value: '38.1',
    sfe_type: 'temperature',
    device_type: 'thermostat',
  },
];

describe('GetAnalyticsData', () => {
  let adapter: GetAnalyticsData;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAnalyticsData,
        {
          provide: 'READ_TIMESERIES_REPOSITORY_PORT',
          useValue: mockRepository,
        },
      ],
    }).compile();

    adapter = module.get<GetAnalyticsData>(GetAnalyticsData);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getDataByPlantId', () => {
    it('should call repository.query with correct serialized params', async () => {
      mockRepository.query.mockResolvedValue([]);

      await adapter.getDataByPlantId('plant-001', startDate);

      expect(mockRepository.query).toHaveBeenCalledTimes(1);
      expect(mockRepository.query).toHaveBeenCalledWith(
        JSON.stringify({ plantId: 'plant-001', startDate }),
      );
    });

    it('should return a map grouped by ISO timestamp with correct datapoint fields', async () => {
      mockRepository.query.mockResolvedValue(mockDatapointRows);

      const result = await adapter.getDataByPlantId('plant-001', startDate);

      expect(result.size).toBe(2);

      const slot8 = result.get('2024-01-01T08:00:00.000Z');
      expect(slot8).toHaveLength(2);
      expect(slot8![0]).toEqual({
        datapointId: 'dp-001',
        value: '42.5',
        sfeType: 'temperature',
        deviceType: 'sensor',
      });
      expect(slot8![1]).toEqual({
        datapointId: 'dp-002',
        value: '55.0',
        sfeType: 'humidity',
        deviceType: 'sensor',
      });

      const slot9 = result.get('2024-01-01T09:00:00.000Z');
      expect(slot9).toHaveLength(1);
      expect(slot9![0]).toEqual({
        datapointId: 'dp-003',
        value: '38.1',
        sfeType: 'temperature',
        deviceType: 'thermostat',
      });
    });

    it('should return an empty map when repository returns no rows', async () => {
      mockRepository.query.mockResolvedValue([]);

      const result = await adapter.getDataByPlantId('plant-001', startDate);

      expect(result.size).toBe(0);
    });
  });

  describe('getDataByWardId', () => {
    it('should call repository.query with correct serialized params', async () => {
      mockRepository.query.mockResolvedValue([]);

      await adapter.getDataByWardId('ward-001', startDate);

      expect(mockRepository.query).toHaveBeenCalledWith(
        JSON.stringify({ wardId: 'ward-001', startDate }),
      );
    });

    it('should return a correctly grouped map', async () => {
      mockRepository.query.mockResolvedValue(mockDatapointRows);

      const result = await adapter.getDataByWardId('ward-001', startDate);

      expect(result.size).toBe(2);
      expect(result.get('2024-01-01T08:00:00.000Z')).toHaveLength(2);
      expect(result.get('2024-01-01T09:00:00.000Z')).toHaveLength(1);
    });

    it('should return an empty map when repository returns no rows', async () => {
      mockRepository.query.mockResolvedValue([]);

      const result = await adapter.getDataByWardId('ward-001', startDate);

      expect(result.size).toBe(0);
    });
  });

  describe('getDataBySensorId', () => {
    it('should call repository.query with correct serialized params', async () => {
      mockRepository.query.mockResolvedValue([]);

      await adapter.getDataBySensorId('sensor-001', startDate);

      expect(mockRepository.query).toHaveBeenCalledWith(
        JSON.stringify({ sensorId: 'sensor-001', startDate }),
      );
    });

    it('should return a correctly grouped map', async () => {
      mockRepository.query.mockResolvedValue(mockDatapointRows);

      const result = await adapter.getDataBySensorId('sensor-001', startDate);

      expect(result.size).toBe(2);
      expect(result.get('2024-01-01T08:00:00.000Z')).toHaveLength(2);
    });

    it('should return an empty map when repository returns no rows', async () => {
      mockRepository.query.mockResolvedValue([]);

      const result = await adapter.getDataBySensorId('sensor-001', startDate);

      expect(result.size).toBe(0);
    });
  });

  describe('getAlarmsByWardId', () => {
    const mockAlarmRows = [
      { day: '2024-01-01', alarm_count: '3' },
      { day: '2024-01-02', alarm_count: '7' },
    ];

    const mockAlarmRowsWithDateObject = [
      { day: new Date('2024-01-03T00:00:00.000Z'), alarm_count: '5' },
    ];

    it('should call repository.query with correct params when onlyResolved is false', async () => {
      mockRepository.query.mockResolvedValue([]);

      await adapter.getAlarmsByWardId('ward-001', startDate, false);

      expect(mockRepository.query).toHaveBeenCalledWith(
        JSON.stringify({
          wardId: 'ward-001',
          startDate,
          alarms: true,
          onlyResolved: false,
        }),
      );
    });

    it('should call repository.query with correct params when onlyResolved is true', async () => {
      mockRepository.query.mockResolvedValue([]);

      await adapter.getAlarmsByWardId('ward-001', startDate, true);

      expect(mockRepository.query).toHaveBeenCalledWith(
        JSON.stringify({
          wardId: 'ward-001',
          startDate,
          alarms: true,
          onlyResolved: true,
        }),
      );
    });

    it('should return a map keyed by day string with parsed alarm counts', async () => {
      mockRepository.query.mockResolvedValue(mockAlarmRows);

      const result = await adapter.getAlarmsByWardId(
        'ward-001',
        startDate,
        false,
      );

      expect(result.size).toBe(2);
      expect(result.get('2024-01-01')).toBe(3);
      expect(result.get('2024-01-02')).toBe(7);
    });

    it('should handle day field as a Date object and convert it to ISO date string', async () => {
      mockRepository.query.mockResolvedValue(mockAlarmRowsWithDateObject);

      const result = await adapter.getAlarmsByWardId(
        'ward-001',
        startDate,
        false,
      );

      expect(result.size).toBe(1);
      expect(result.get('2024-01-03')).toBe(5);
    });

    it('should return an empty map when repository returns no rows', async () => {
      mockRepository.query.mockResolvedValue([]);

      const result = await adapter.getAlarmsByWardId(
        'ward-001',
        startDate,
        false,
      );

      expect(result.size).toBe(0);
    });
  });
});
