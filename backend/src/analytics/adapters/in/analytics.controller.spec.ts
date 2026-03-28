import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { Plot } from '../../domain/plot.model';
import { GetAnalyticsUseCase } from '../../application/ports/in/get-analytics.usecase';
import { PlotDto } from '../../infrastructure/dtos/plot.dto';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const yesterday = toISO(1);
const twoDaysAgo = toISO(2);

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let mockUseCase: jest.Mocked<GetAnalyticsUseCase>;

  beforeEach(async () => {
    mockUseCase = {
      getAnalytics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: 'GET_ANALYTICS_USECASE',
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return PlotDto mapped from domain model', async () => {
    const plot = new Plot(
      'Plant Consumption Analytics',
      'plant-consumption',
      [twoDaysAgo, yesterday],
      ['20.00', '40.00'],
    );

    mockUseCase.getAnalytics.mockResolvedValue(plot);

    const result = await controller.getAnalytics({
      metric: 'plant-consumption',
      id: 'plant-001',
    });

    expect(result).toBeInstanceOf(PlotDto);
    expect(result.title).toBe('Plant Consumption Analytics');
    expect(result.metric).toBe('plant-consumption');
    expect(result.labels).toEqual([twoDaysAgo, yesterday]);
    expect(result.data).toEqual(['20.00', '40.00']);
  });

  it('should pass metric and id to use case as GetAnalyticsCmd', async () => {
    const plot = new Plot('Ward Falls Analytics', 'ward-falls', [], []);
    mockUseCase.getAnalytics.mockResolvedValue(plot);

    await controller.getAnalytics({ metric: 'ward-falls', id: '1' });

    expect(mockUseCase.getAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ metric: 'ward-falls', id: '1' }),
    );
  });

  it('should return PlotDto with series when plot has series', async () => {
    const plot = new Plot(
      'Ward Resolved Alarm Analytics',
      'ward-resolved-alarm',
      [yesterday],
      ['3'],
      { resolved: ['2'] },
    );

    mockUseCase.getAnalytics.mockResolvedValue(plot);

    const result = await controller.getAnalytics({
      metric: 'ward-resolved-alarm',
      id: '1',
    });

    expect(result.series).toEqual({ resolved: ['2'] });
  });

  it('should return PlotDto with empty labels and data when plot is empty', async () => {
    const plot = new Plot('Ward Falls Analytics', 'ward-falls', [], []);
    mockUseCase.getAnalytics.mockResolvedValue(plot);

    const result = await controller.getAnalytics({
      metric: 'ward-falls',
      id: '1',
    });

    expect(result.labels).toHaveLength(0);
    expect(result.data).toHaveLength(0);
  });
});
