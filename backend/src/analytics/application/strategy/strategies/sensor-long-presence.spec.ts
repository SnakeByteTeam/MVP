import { SensorLongPresence } from './sensor-long-presence';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { DatapointValue } from 'src/analytics/domain/datapoint-value.model';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const yesterday = toISO(1);

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

// Costruisce un timestamp relativo a ieri con ore e minuti specifici
const ts = (hours: number, minutes: number = 0): string =>
  `${yesterday}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`;

describe('SensorLongPresence', () => {
  let strategy: SensorLongPresence;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataForPlant: jest.fn(),
      getDataForWard: jest.fn(),
      getAlarmsForWard: jest.fn(),
      getDataForSensor: jest.fn(),
    };
    strategy = new SensorLongPresence(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getDataForSensor.mockResolvedValue(new Map());

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-long-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getData()).toHaveLength(0);
  });

  it('should not detect long presence if duration is less than 30 minutes', async () => {
    const snapshots = new Map([
      [ts(8, 0), buildPresenceDatapoint('Detected')],
      [ts(8, 20), buildPresenceDatapoint('Detected')], // solo 20 minuti
      [ts(8, 25), buildPresenceDatapoint('NotDetected')],
    ]);

    mockPort.getDataForSensor.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-long-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toHaveLength(0);
  });

  it('should detect long presence if duration exceeds 30 minutes', async () => {
    const snapshots = new Map([
      [ts(8, 0), buildPresenceDatapoint('Detected')],
      [ts(8, 35), buildPresenceDatapoint('Detected')],
      [ts(9, 0), buildPresenceDatapoint('NotDetected')],
    ]);

    mockPort.getDataForSensor.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-long-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe('1');
  });

  it('should count only one event per long presence session', async () => {
    const snapshots = new Map([
      [ts(8, 0), buildPresenceDatapoint('Detected')],
      [ts(8, 35), buildPresenceDatapoint('Detected')],
      [ts(9, 10), buildPresenceDatapoint('Detected')],
      [ts(9, 30), buildPresenceDatapoint('NotDetected')],
    ]);

    mockPort.getDataForSensor.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-long-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe('1');
  });

  it('should reset and count a new event after NotDetected', async () => {
    const snapshots = new Map([
      [ts(8, 0), buildPresenceDatapoint('Detected')],
      [ts(8, 35), buildPresenceDatapoint('Detected')],
      [ts(9, 0), buildPresenceDatapoint('NotDetected')],
      [ts(10, 0), buildPresenceDatapoint('Detected')],
      [ts(10, 35), buildPresenceDatapoint('Detected')],
      [ts(11, 0), buildPresenceDatapoint('NotDetected')],
    ]);

    mockPort.getDataForSensor.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('sensor-long-presence', 'dp-presence-001'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe('2');
  });
});
