import { PlantAnomalies } from './plant-anomalies';
import { PlantConsumption } from './plant-consumption';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { ANOMALY_THRESHOLD_WH } from './consumption-config';
import { Plot } from 'src/analytics/domain/plot.model';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const yesterday = toISO(1);
const twoDaysAgo = toISO(2);

describe('PlantAnomalies', () => {
  let strategy: PlantAnomalies;
  let mockPlantConsumption: jest.Mocked<PlantConsumption>;

  beforeEach(() => {
    mockPlantConsumption = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<PlantConsumption>;

    strategy = new PlantAnomalies(mockPlantConsumption);
  });

  it('should return an empty Plot if there are no consumption data', async () => {
    const emptyPlot = new Plot(
      'Plant Consumption Analytics',
      'plant-consumption',
      [],
      [],
    );
    mockPlantConsumption.execute.mockResolvedValue(emptyPlot);

    const result = await strategy.execute(
      new GetAnalyticsCmd('plant-anomalies', 'plant-001'),
    );

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getData()).toHaveLength(0);
  });

  it('should detect anomaly when consumption exceeds threshold', async () => {
    const anomalyValue = (ANOMALY_THRESHOLD_WH + 10).toFixed(2);

    const plotWithData = new Plot(
      'Plant Consumption Analytics',
      'plant-consumption',
      [yesterday],
      [anomalyValue],
    );

    mockPlantConsumption.execute.mockResolvedValue(plotWithData);

    const result = await strategy.execute(
      new GetAnalyticsCmd('plant-anomalies', 'plant-001'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe(anomalyValue);
  });

  it('should not detect anomaly when consumption is below threshold', async () => {
    const normalValue = (ANOMALY_THRESHOLD_WH - 10).toFixed(2);
    const plotWithData = new Plot(
      'Plant Consumption Analytics',
      'plant-consumption',
      [yesterday],
      [normalValue],
    );

    mockPlantConsumption.execute.mockResolvedValue(plotWithData);

    const result = await strategy.execute(
      new GetAnalyticsCmd('plant-anomalies', 'plant-001'),
    );

    expect(result.getLabels()).toHaveLength(0);
  });

  it('should detect anomalies only on days that exceed threshold', async () => {
    const anomalyValue = (ANOMALY_THRESHOLD_WH + 10).toFixed(2);
    const normalValue = (ANOMALY_THRESHOLD_WH - 10).toFixed(2);

    const plotWithData = new Plot(
      'Plant Consumption Analytics',
      'plant-consumption',
      [twoDaysAgo, yesterday],
      [normalValue, anomalyValue],
    );

    mockPlantConsumption.execute.mockResolvedValue(plotWithData);

    const result = await strategy.execute(
      new GetAnalyticsCmd('plant-anomalies', 'plant-001'),
    );

    expect(result.getLabels()).toHaveLength(1);
    expect(result.getLabels()[0]).toBe(yesterday);
    expect(result.getData()[0]).toBe(anomalyValue);
  });
});
