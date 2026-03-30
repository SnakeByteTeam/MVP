import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsStrategy } from '../strategy/analytics.strategy';
import { GetAnalyticsCmd } from '../commands/get-analytics.cmd';
import { Plot } from 'src/analytics/domain/plot.model';

const mockPlot = new Plot(
  'Plant Consumption Analytics',
  'plant-consumption',
  'Wh',
  [],
  [],
);

const mockCmd: GetAnalyticsCmd = {
  id: 'plant-001-a',
  metric: 'plant-consumption',
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
    it('should return a Plot when a valid strategy is found', async () => {
      mockStrategy.execute.mockResolvedValue(mockPlot);

      const result = await service.getAnalytics(mockCmd);

      expect(mockStrategy.execute).toHaveBeenCalledTimes(1);
      expect(mockStrategy.execute).toHaveBeenCalledWith(mockCmd);
      expect(result).toEqual(mockPlot);
    });

    it('should throw an error when no strategy is found for the given metric', async () => {
      const unknownCmd: GetAnalyticsCmd = {
        ...mockCmd,
        metric: 'unknown-metric',
      };

      await expect(service.getAnalytics(unknownCmd)).rejects.toThrow(
        'No strategy found for metric: unknown-metric',
      );

      expect(mockStrategy.execute).not.toHaveBeenCalled();
    });

    it('should call the correct strategy when multiple strategies are registered', async () => {
      const wardFallsPlot = new Plot(
        'Ward Falls Analytics',
        'ward-falls',
        '',
        [],
        [],
      );
      const wardFallsStrategy: jest.Mocked<AnalyticsStrategy> = {
        execute: jest.fn().mockResolvedValue(wardFallsPlot),
      };

      strategiesMap.set('ward-falls', wardFallsStrategy);
      mockStrategy.execute.mockResolvedValue(mockPlot);

      const wardFallsCmd: GetAnalyticsCmd = {
        ...mockCmd,
        metric: 'ward-falls',
      };
      const result = await service.getAnalytics(wardFallsCmd);

      expect(wardFallsStrategy.execute).toHaveBeenCalledWith(wardFallsCmd);
      expect(mockStrategy.execute).not.toHaveBeenCalled();
      expect(result).toEqual(wardFallsPlot);
    });

    it('should propagate errors thrown by the strategy', async () => {
      const strategyError = new Error('Strategy execution failed');
      mockStrategy.execute.mockRejectedValue(strategyError);

      await expect(service.getAnalytics(mockCmd)).rejects.toThrow(
        'Strategy execution failed',
      );

      expect(mockStrategy.execute).toHaveBeenCalledWith(mockCmd);
    });
  });
});
