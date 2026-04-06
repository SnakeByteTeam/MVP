import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as http from 'node:http';
import request from 'supertest';
import { AnalyticsController } from 'src/analytics/adapters/in/analytics.controller';
import { AnalyticsService } from 'src/analytics/application/services/analytics.service';
import { AnalyticsStrategy } from 'src/analytics/application/strategy/analytics.strategy';
import { Plot } from 'src/analytics/domain/plot.model';
import {
  GET_SUGGESTION_USECASE,
  GetSuggestionUseCase,
} from 'src/analytics/application/ports/in/get-suggestion.usecase';
import { ANALYTICS_STRATEGIES_TOKEN } from 'src/analytics/analytics.module';

const PLANT_ID = 'plant-42';

function makeMockPlot(
  metric = 'plant-consumption',
  unit = 'Wh',
): jest.Mocked<Plot> {
  return {
    getTitle: jest.fn().mockReturnValue('Plant Consumption'),
    getMetric: jest.fn().mockReturnValue(metric),
    getUnit: jest.fn().mockReturnValue(unit),
    getLabels: jest
      .fn()
      .mockReturnValue(['2024-01-10', '2024-01-11', '2024-01-12']),
    getSeries: jest.fn().mockReturnValue([]),
    getSuggestion: jest.fn().mockReturnValue(undefined),
    setSuggestion: jest.fn(),
  } as unknown as jest.Mocked<Plot>;
}

function makeMockStrategy(plot: Plot): jest.Mocked<AnalyticsStrategy> {
  return {
    execute: jest.fn().mockResolvedValue(plot),
  } as unknown as jest.Mocked<AnalyticsStrategy>;
}

describe('Analytics Integration Test', () => {
  let app: INestApplication;
  let mockPlot: jest.Mocked<Plot>;
  let mockStrategy: jest.Mocked<AnalyticsStrategy>;
  let mockGetSuggestionUseCase: jest.Mocked<GetSuggestionUseCase>;

  beforeEach(async () => {
    mockPlot = makeMockPlot();
    mockStrategy = makeMockStrategy(mockPlot);

    mockGetSuggestionUseCase = {
      getSuggestion: jest
        .fn()
        .mockResolvedValue('Reduce energy consumption during peak hours.'),
    } as unknown as jest.Mocked<GetSuggestionUseCase>;

    const strategies = new Map<string, AnalyticsStrategy>([
      ['energyStrategy', mockStrategy],
    ]);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: 'GET_ANALYTICS_USECASE',
          useClass: AnalyticsService,
        },
        {
          provide: ANALYTICS_STRATEGIES_TOKEN,
          useValue: strategies,
        },
        {
          provide: GET_SUGGESTION_USECASE,
          useValue: mockGetSuggestionUseCase,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should retrieve all analytics given the plantId', async () => {
    const response = await request(app.getHttpServer() as http.Server)
      .get(`/analytics/${PLANT_ID}`)
      .expect(200);

    expect(mockStrategy.execute).toHaveBeenCalledWith(
      expect.objectContaining({ plantId: PLANT_ID }),
    );

    expect(mockGetSuggestionUseCase.getSuggestion).toHaveBeenCalledTimes(1);
    expect(mockGetSuggestionUseCase.getSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({
        metric: mockPlot.getMetric(),
        unit: mockPlot.getUnit(),
        labels: mockPlot.getLabels(),
        series: mockPlot.getSeries(),
      }),
    );

    expect(mockPlot.setSuggestion).toHaveBeenCalledWith(
      'Reduce energy consumption during peak hours.',
    );

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body).toHaveLength(1);
  });

  it('should return one PlotDto per strategy', async () => {
    await app.close();

    const plotA = makeMockPlot('plant-consumption', 'Wh');
    const plotB = makeMockPlot('thermostat-temperature', '°C');

    const multiStrategies = new Map<string, AnalyticsStrategy>([
      ['plant-consumption', makeMockStrategy(plotA)],
      ['thermostat-temperature', makeMockStrategy(plotB)],
    ]);

    const module2: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: 'GET_ANALYTICS_USECASE', useClass: AnalyticsService },
        { provide: ANALYTICS_STRATEGIES_TOKEN, useValue: multiStrategies },
        { provide: GET_SUGGESTION_USECASE, useValue: mockGetSuggestionUseCase },
      ],
    }).compile();

    app = module2.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer() as http.Server)
      .get(`/analytics/${PLANT_ID}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(mockGetSuggestionUseCase.getSuggestion).toHaveBeenCalledTimes(2);
  });

  it('should return 500 when all strategies fail', async () => {
    await app.close();

    const failingStrategy = {
      execute: jest
        .fn()
        .mockRejectedValue(new Error('Data source unavailable')),
    } as unknown as AnalyticsStrategy;

    const module3: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: 'GET_ANALYTICS_USECASE', useClass: AnalyticsService },
        {
          provide: ANALYTICS_STRATEGIES_TOKEN,
          useValue: new Map([['failingStrategy', failingStrategy]]),
        },
        { provide: GET_SUGGESTION_USECASE, useValue: mockGetSuggestionUseCase },
      ],
    }).compile();

    app = module3.createNestApplication();
    await app.init();

    await request(app.getHttpServer() as http.Server)
      .get(`/analytics/${PLANT_ID}`)
      .expect(500);
  });

  it('should return 404 when plantId query param is missing', async () => {
    await request(app.getHttpServer() as http.Server)
      .get('/analytics')
      .expect(404);
  });
});
