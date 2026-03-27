import { SensorPresence } from './sensor-presence';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { DatapointValue } from 'src/analytics/domain/datapoint-value.model';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const yesterday = toISO(1);
const twoDaysAgo = toISO(2);

const buildPresenceDatapoint = (
  value: 'NotDetected' | 'Detected',
): DatapointValue[] => [
  {
    datapointId: 'dp-presence-001',
    value,
    sfeType: 'SFE_State_Presence',
    deviceType: 'SF_Access',
  },
];

describe('SensorPresence', () => {
  let strategy: SensorPresence;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataByPlantId: jest.fn(),
      getDataByWardId: jest.fn(),
      getAlarmsByWardId: jest.fn(),
      getDataBySensorId: jest.fn(),
    };
    strategy = new SensorPresence(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getDataBySensorId.mockResolvedValue(new Map());

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getData()).toHaveLength(0);
  });

  it('should detect presence when it changes from NotDetected to Detected', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('NotDetected')],
      [`${yesterday}T09:00:00.000Z`, buildPresenceDatapoint('Detected')],
    ]);

    mockPort.getDataBySensorId.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe('1');
  });

  it('should not count presence if value stays Detected', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('Detected')],
      [`${yesterday}T09:00:00.000Z`, buildPresenceDatapoint('Detected')],
      [`${yesterday}T10:00:00.000Z`, buildPresenceDatapoint('Detected')],
    ]);

    mockPort.getDataBySensorId.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toHaveLength(0);
  });

  it('should count two separate presences on the same day', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('NotDetected')],
      [`${yesterday}T09:00:00.000Z`, buildPresenceDatapoint('Detected')],
      [`${yesterday}T10:00:00.000Z`, buildPresenceDatapoint('NotDetected')],
      [`${yesterday}T11:00:00.000Z`, buildPresenceDatapoint('Detected')],
    ]);

    mockPort.getDataBySensorId.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe('2');
  });

  it('should correctly aggregate presences over multiple days', async () => {
    const snapshots = new Map([
      [`${twoDaysAgo}T08:00:00.000Z`, buildPresenceDatapoint('NotDetected')],
      [`${twoDaysAgo}T09:00:00.000Z`, buildPresenceDatapoint('Detected')],
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('NotDetected')],
      [`${yesterday}T09:00:00.000Z`, buildPresenceDatapoint('Detected')],
      [`${yesterday}T10:00:00.000Z`, buildPresenceDatapoint('NotDetected')],
      [`${yesterday}T11:00:00.000Z`, buildPresenceDatapoint('Detected')],
    ]);

    mockPort.getDataBySensorId.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toHaveLength(2);
    expect(result.getLabels()[0]).toBe(twoDaysAgo);
    expect(result.getLabels()[1]).toBe(yesterday);
    expect(result.getData()[0]).toBe('1');
    expect(result.getData()[1]).toBe('2');
  });
});
