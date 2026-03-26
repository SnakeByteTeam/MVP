import { PlantAnomalies } from './plant-anomalies';
import { PlantConsumption } from './plant-consumption';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { ANOMALY_THRESHOLD_WH } from './consumption-config';

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
    mockPlantConsumption.execute.mockResolvedValue({
      title: 'Plant Consumption Analytics',
      metric: 'plant-consumption',
      labels: [],
      data: [],
    } as any);

    const result = await strategy.execute(
      new GetAnalyticsCmd('plant-anomalies', 'plant-001'),
    );

    expect(result.labels).toHaveLength(0);
    expect(result.data).toHaveLength(0);
  });

  it('should detect anomaly when consumption exceeds threshold', async () => {
    const anomalyValue = (ANOMALY_THRESHOLD_WH + 10).toFixed(2);

    mockPlantConsumption.execute.mockResolvedValue({
      title: 'Plant Consumption Analytics',
      metric: 'plant-consumption',
      labels: [yesterday],
      data: [anomalyValue],
    } as any);

    const result = await strategy.execute(
      new GetAnalyticsCmd('plant-anomalies', 'plant-001'),
    );

    expect(result.labels).toContain(yesterday);
    expect(result.data[0]).toBe(anomalyValue);
  });

  it('should not detect anomaly when consumption is below threshold', async () => {
    const normalValue = (ANOMALY_THRESHOLD_WH - 10).toFixed(2);

    mockPlantConsumption.execute.mockResolvedValue({
      title: 'Plant Consumption Analytics',
      metric: 'plant-consumption',
      labels: [yesterday],
      data: [normalValue],
    } as any);

    const result = await strategy.execute(
      new GetAnalyticsCmd('plant-anomalies', 'plant-001'),
    );

    expect(result.labels).toHaveLength(0);
  });

  it('should detect anomalies only on days that exceed threshold', async () => {
    const anomalyValue = (ANOMALY_THRESHOLD_WH + 10).toFixed(2);
    const normalValue = (ANOMALY_THRESHOLD_WH - 10).toFixed(2);

    mockPlantConsumption.execute.mockResolvedValue({
      title: 'Plant Consumption Analytics',
      metric: 'plant-consumption',
      labels: [twoDaysAgo, yesterday],
      data: [normalValue, anomalyValue],
    } as any);

    const result = await strategy.execute(
      new GetAnalyticsCmd('plant-anomalies', 'plant-001'),
    );

    expect(result.labels).toHaveLength(1);
    expect(result.labels[0]).toBe(yesterday);
    expect(result.data[0]).toBe(anomalyValue);
  });
});
