import { SensorPresence } from './sensor-presence';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { DatapointValue } from 'src/analytics/domain/datapoint-value.model';
import { AnalyticsMetric } from 'src/analytics/infrastructure/dtos/analytics.metric.dto';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const yesterday = toISO(1);
const twoDaysAgo = toISO(2);
const presenceSfeType = AnalyticsMetric.SENSOR_PRESENCE.sfeType ?? '';

const buildPresenceDatapoint = (
  value: 'Absent' | 'Moving',
): DatapointValue[] => [
  {
    datapointId: 'dp-presence-001',
    name: 'Presence Sensor',
    value,
    sfeType: presenceSfeType,
    deviceType: 'SF_Access',
  },
];

describe('SensorPresence', () => {
  let strategy: SensorPresence;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataForPlant: jest.fn(),
      getDataForWard: jest.fn(),
      getAlarmsForWard: jest.fn(),
      getDataForSensor: jest.fn(),
    };
    strategy = new SensorPresence(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getDataForSensor.mockResolvedValue(new Map());

    const result = await strategy.execute(
      new GetAnalyticsCmd('dp-presence-001'),
    );

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getSeries()).toHaveLength(0);
  });

  it('should detect presence when it changes from Absent to Moving', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('Absent')],
      [`${yesterday}T09:00:00.000Z`, buildPresenceDatapoint('Moving')],
    ]);

    mockPort.getDataForSensor.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('dp-presence-001'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(1);
  });

  it('should not count presence if value stays Moving', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('Moving')],
      [`${yesterday}T09:00:00.000Z`, buildPresenceDatapoint('Moving')],
      [`${yesterday}T10:00:00.000Z`, buildPresenceDatapoint('Moving')],
    ]);

    mockPort.getDataForSensor.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('dp-presence-001'),
    );

    expect(result.getLabels()).toHaveLength(0);
  });

  it('should count two separate presences on the same day', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('Absent')],
      [`${yesterday}T09:00:00.000Z`, buildPresenceDatapoint('Moving')],
      [`${yesterday}T10:00:00.000Z`, buildPresenceDatapoint('Absent')],
      [`${yesterday}T11:00:00.000Z`, buildPresenceDatapoint('Moving')],
    ]);

    mockPort.getDataForSensor.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('dp-presence-001'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(2);
  });

  it('should correctly aggregate presences over multiple days', async () => {
    const snapshots = new Map([
      [`${twoDaysAgo}T08:00:00.000Z`, buildPresenceDatapoint('Absent')],
      [`${twoDaysAgo}T09:00:00.000Z`, buildPresenceDatapoint('Moving')],
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('Absent')],
      [`${yesterday}T09:00:00.000Z`, buildPresenceDatapoint('Moving')],
      [`${yesterday}T10:00:00.000Z`, buildPresenceDatapoint('Absent')],
      [`${yesterday}T11:00:00.000Z`, buildPresenceDatapoint('Moving')],
    ]);

    mockPort.getDataForSensor.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('dp-presence-001'),
    );

    expect(result.getLabels()).toHaveLength(2);
    expect(result.getLabels()[0]).toBe(twoDaysAgo);
    expect(result.getLabels()[1]).toBe(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(1);
    expect(result.getSeries()[0].getData()[1]).toBe(2);
  });
});
