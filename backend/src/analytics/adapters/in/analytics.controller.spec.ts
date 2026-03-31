import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { Plot } from '../../domain/plot.model';
import { GetAnalyticsUseCase } from '../../application/ports/in/get-analytics.usecase';
import { PlotDto } from '../../infrastructure/dtos/plot.dto';
import { Series } from 'src/analytics/domain/series.model';

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
      getAnalyticsByPlantId: jest.fn(),
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

  it('should return an array of PlotDto mapped from domain models', async () => {
    const plots: Plot[] = [
      new Plot(
        'Plant Consumption Analytics',
        'plant-consumption',
        'Wh',
        [twoDaysAgo, yesterday],
        [new Series('consumption', 'Consumption', [20, 40])],
      ),
    ];

    mockUseCase.getAnalyticsByPlantId.mockResolvedValue(plots);

    const result = await controller.getAnalyticsByPlantId({
      plantId: 'plant-001',
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(PlotDto);
    expect(result[0].title).toBe('Plant Consumption Analytics');
    expect(result[0].metric).toBe('plant-consumption');
    expect(result[0].labels).toEqual([twoDaysAgo, yesterday]);
  });

  it('should pass plantId to use case as GetAnalyticsCmd', async () => {
    mockUseCase.getAnalyticsByPlantId.mockResolvedValue([]);

    await controller.getAnalyticsByPlantId({ plantId: 'plant-001' });

    expect(mockUseCase.getAnalyticsByPlantId).toHaveBeenCalledWith(
      expect.objectContaining({ plantId: 'plant-001' }),
    );
  });

  it('should return PlotDto with series when plot has series', async () => {
    const plots: Plot[] = [
      new Plot(
        'Ward Resolved Alarm Analytics',
        'ward-resolved-alarm',
        'alarms',
        [yesterday],
        [
          new Series('total', 'Total Alarms', [3]),
          new Series('resolved', 'Resolved Alarms', [2]),
        ],
      ),
    ];

    mockUseCase.getAnalyticsByPlantId.mockResolvedValue(plots);

    const result = await controller.getAnalyticsByPlantId({ plantId: '1' });

    expect(result[0].series).toBeDefined();
  });

  it('should return empty array when use case returns no plots', async () => {
    mockUseCase.getAnalyticsByPlantId.mockResolvedValue([]);

    const result = await controller.getAnalyticsByPlantId({
      plantId: 'plant-001',
    });

    expect(result).toHaveLength(0);
  });

  it('should return PlotDto with empty labels and series when plot is empty', async () => {
    const plots: Plot[] = [
      new Plot('Ward Falls Analytics', 'ward-falls', 'falls', [], []),
    ];

    mockUseCase.getAnalyticsByPlantId.mockResolvedValue(plots);

    const result = await controller.getAnalyticsByPlantId({ plantId: '1' });

    expect(result[0].labels).toHaveLength(0);
    expect(result[0].series).toHaveLength(0);
  });
});
