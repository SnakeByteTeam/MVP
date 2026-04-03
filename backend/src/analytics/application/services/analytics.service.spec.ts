import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsStrategy } from '../strategy/analytics.strategy';
import { GetAnalyticsCmd } from '../commands/get-analytics.cmd';
import { Plot } from 'src/analytics/domain/plot.model';
import { Series } from 'src/analytics/domain/series.model';
import { Suggestion } from 'src/analytics/domain/suggestion.model';
import {
  GetSuggestionUseCase,
  GET_SUGGESTION_USECASE,
} from '../ports/in/get-suggestion.usecase';
import { ANALYTICS_STRATEGIES_TOKEN } from 'src/analytics/analytics.module';
import { Logger } from '@nestjs/common';

const mockSuggestion = new Suggestion(['Turn off the lights.'], true);

const mockPlot: Plot = new Plot(
  'Plant Consumption Analytics',
  'plant-consumption',
  'Wh',
  [],
  [],
);

const mockCmd: GetAnalyticsCmd = {
  plantId: 'plant-001-a',
};

const mockStrategy: jest.Mocked<AnalyticsStrategy> = {
  execute: jest.fn(),
};

const mockSuggestionUseCase: jest.Mocked<GetSuggestionUseCase> = {
  getSuggestion: jest.fn(),
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let strategiesMap: Map<string, AnalyticsStrategy>;

  beforeAll(() => {
    jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

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
          provide: ANALYTICS_STRATEGIES_TOKEN,
          useValue: strategiesMap,
        },
        {
          provide: GET_SUGGESTION_USECASE,
          useValue: mockSuggestionUseCase,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnalyticsByPlantId', () => {
    it('should return all Plots when all strategies succeed', async () => {
      mockStrategy.execute.mockResolvedValue(mockPlot);
      mockSuggestionUseCase.getSuggestion.mockResolvedValue(mockSuggestion);

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
      mockSuggestionUseCase.getSuggestion.mockResolvedValue(mockSuggestion);

      const result = await service.getAnalyticsByPlantId(mockCmd);

      expect(result).toHaveLength(7);
    });

    it('should return plots with correct title and metric', async () => {
      const consumptionPlot = new Plot(
        'Plant Consumption Analytics',
        'plant-consumption',
        'Wh',
        [],
        [new Series('consumption', 'Consumption', [20, 40])],
      );
      mockStrategy.execute.mockResolvedValue(consumptionPlot);
      mockSuggestionUseCase.getSuggestion.mockResolvedValue(mockSuggestion);

      const result = await service.getAnalyticsByPlantId(mockCmd);

      expect(result[0].getTitle()).toBe('Plant Consumption Analytics');
      expect(result[0].getMetric()).toBe('plant-consumption');
    });

    it('should attach suggestion to each plot', async () => {
      mockStrategy.execute.mockResolvedValue(mockPlot);
      mockSuggestionUseCase.getSuggestion.mockResolvedValue(mockSuggestion);

      const result = await service.getAnalyticsByPlantId(mockCmd);

      expect(result[0].getSuggestion()).toBe(mockSuggestion);
    });

    it('should call getSuggestion once per successful plot', async () => {
      mockStrategy.execute.mockResolvedValue(mockPlot);
      mockSuggestionUseCase.getSuggestion.mockResolvedValue(mockSuggestion);

      await service.getAnalyticsByPlantId(mockCmd);

      expect(mockSuggestionUseCase.getSuggestion).toHaveBeenCalledTimes(8);
    });
  });
});
