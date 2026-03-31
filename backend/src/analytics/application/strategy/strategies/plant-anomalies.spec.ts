import { PlantAnomalies } from './plant-anomalies';
import { PlantConsumption } from './plant-consumption';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { ANOMALY_THRESHOLD_WH } from './consumption-config';
import { Plot } from 'src/analytics/domain/plot.model';
import { Series } from 'src/analytics/domain/series.model';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const yesterday = toISO(1);
const twoDaysAgo = toISO(2);

const buildConsumptionPlot = (labels: string[], values: number[]): Plot =>
  new Plot('Plant Consumption Analytics', 'plant-consumption', 'Wh', labels, [
    new Series('plant-consumption', 'Consumption', values),
  ]);

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

  it('should return an empty Plot if there are no consumption data', async () => {
    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot([], []),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getSeries()[0].getData()).toHaveLength(0);
  });

  it('should detect anomaly when consumption exceeds threshold', async () => {
    const anomalyValue = ANOMALY_THRESHOLD_WH + 10;

    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot([yesterday], [anomalyValue]),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(anomalyValue);
  });

  it('should not detect anomaly when consumption is below threshold', async () => {
    const normalValue = ANOMALY_THRESHOLD_WH - 10;

    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot([yesterday], [normalValue]),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(0);
  });

  it('should detect anomalies only on days that exceed threshold', async () => {
    const anomalyValue = ANOMALY_THRESHOLD_WH + 10;
    const normalValue = ANOMALY_THRESHOLD_WH - 10;

    mockPlantConsumption.execute.mockResolvedValue(
      buildConsumptionPlot(
        [twoDaysAgo, yesterday],
        [normalValue, anomalyValue],
      ),
    );

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(1);
    expect(result.getLabels()[0]).toBe(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(anomalyValue);
  });
});
