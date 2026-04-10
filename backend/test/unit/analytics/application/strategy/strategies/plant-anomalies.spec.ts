import { PlantAnomalies } from 'src/analytics/application/strategy/strategies/plant-anomalies';
import { PlantConsumption } from 'src/analytics/application/strategy/strategies/plant-consumption';
import { GetAnalyticsCmd } from 'src/analytics/application/commands/get-analytics.cmd';
import { ANOMALY_THRESHOLD_WH } from 'src/analytics/application/strategy/strategies/consumption-config';
import { Plot } from 'src/analytics/domain/plot.model';
import { Series } from 'src/analytics/domain/series.model';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const yesterday = toISO(1);
const twoDaysAgo = toISO(2);
const threeDaysAgo = toISO(3);

const buildConsumptionPlot = (labels: string[], values: number[]): Plot =>
  new Plot(
    'Plant Consumption Analytics',
    'plant-consumption',
    'Wh',
    labels,
    labels.length > 0
      ? [new Series('plant-consumption', 'Consumption', values)]
      : [],
  );

describe('PlantAnomalies', () => {
  let strategy: PlantAnomalies;
  let mockPlantConsumption: jest.Mocked<PlantConsumption>;

  beforeEach(() => {
    mockPlantConsumption = {
      execute: jest.fn(),
      supports: jest.fn(),
    } as unknown as jest.Mocked<PlantConsumption>;

    strategy = new PlantAnomalies(mockPlantConsumption);
  });

  it('should return an empty Plot if consumption plot has no data', async () => {
    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot([], []),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getSeries()).toHaveLength(0);
  });

  it('should return 1 for a day that exceeds the threshold', async () => {
    const anomalyValue = ANOMALY_THRESHOLD_WH + 10;

    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot([yesterday], [anomalyValue]),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toEqual([yesterday]);
    expect(result.getSeries()[0].getData()[0]).toBe(1);
  });

  it('should return 0 for a day that is below the threshold', async () => {
    const normalValue = ANOMALY_THRESHOLD_WH - 10;

    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot([yesterday], [normalValue]),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toEqual([yesterday]);
    expect(result.getSeries()[0].getData()[0]).toBe(0);
  });

  it('should return correct anomaly flags for each day', async () => {
    const anomalyValue = ANOMALY_THRESHOLD_WH + 10;
    const normalValue = ANOMALY_THRESHOLD_WH - 10;

    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot(
        [threeDaysAgo, twoDaysAgo, yesterday],
        [normalValue, anomalyValue, anomalyValue],
      ),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toEqual([threeDaysAgo, twoDaysAgo, yesterday]);
    expect(result.getSeries()[0].getData()).toEqual([0, 1, 1]);
  });

  it('should preserve labels alignment between labels and data', async () => {
    const values = [
      ANOMALY_THRESHOLD_WH + 1,
      ANOMALY_THRESHOLD_WH - 1,
      ANOMALY_THRESHOLD_WH + 1,
    ];

    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot([threeDaysAgo, twoDaysAgo, yesterday], values),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(3);
    expect(result.getSeries()[0].getData()).toHaveLength(3);
    expect(result.getLabels()[0]).toBe(threeDaysAgo);
    expect(result.getSeries()[0].getData()[0]).toBe(1);
    expect(result.getLabels()[1]).toBe(twoDaysAgo);
    expect(result.getSeries()[0].getData()[1]).toBe(0);
    expect(result.getLabels()[2]).toBe(yesterday);
    expect(result.getSeries()[0].getData()[2]).toBe(1);
  });
});
