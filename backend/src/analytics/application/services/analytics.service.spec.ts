import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsStrategy } from '../strategy/analytics.strategy';
import { GetAnalyticsCmd } from '../commands/get-analytics.cmd';
import { Plot } from 'src/analytics/domain/plot.model';

const mockPlot: Plot = new Plot(
  'Plant Consumption Analytics',
  'plant-consumption',
  '',
  [],
  [],
);

const mockCmd: GetAnalyticsCmd = {
  plantId: 'plant-001-a',
};

const mockStrategy: jest.Mocked<AnalyticsStrategy> = {
  execute: jest.fn(),
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let strategiesMap: Map<string, AnalyticsStrategy>;

  beforeEach(async () => {
    strategiesMap = new Map<string, AnalyticsStrategy>([
      ['plant-consumption', mockStrategy],
      ['plant-anomalies', mockStrategy],
      ['sensor-long-presence', mockStrategy],
      ['sensor-presence', mockStrategy],
      ['thermostat-temperature', mockStrategy],
      ['ward-alarms-frequency', mockStrategy],
      ['ward-falls', mockStrategy],
      ['ward-resolved-alarm', mockStrategy],
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: 'ANALYTICS_STRATEGIES',
          useValue: strategiesMap,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnalytics', () => {
    it('should return all Plots when all strategies succeed', async () => {
      mockStrategy.execute.mockResolvedValue(mockPlot);

      const result = await service.getAnalyticsByPlantId(mockCmd);

      expect(mockStrategy.execute).toHaveBeenCalledTimes(8);
      expect(result).toHaveLength(8);
      expect(result[0]).toEqual(mockPlot);
    });

    it('should throw when all strategies fail', async () => {
      mockStrategy.execute.mockRejectedValue(
        new Error('Strategy execution failed'),
      );

      await expect(service.getAnalyticsByPlantId(mockCmd)).rejects.toThrow(
        `No analytics available for plant ${mockCmd.plantId}`,
      );
    });

    it('should return only successful plots when some strategies fail', async () => {
      const failingStrategy: jest.Mocked<AnalyticsStrategy> = {
        execute: jest.fn().mockRejectedValue(new Error('fail')),
      };
      strategiesMap.set('plant-anomalies', failingStrategy);
      mockStrategy.execute.mockResolvedValue(mockPlot);

      const result = await service.getAnalyticsByPlantId(mockCmd);

      expect(result).toHaveLength(7);
    });
  });
});
