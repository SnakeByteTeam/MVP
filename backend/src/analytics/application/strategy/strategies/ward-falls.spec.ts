import { WardFalls } from './ward-falls';
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

const buildFallDatapoint = (value: string): DatapointValue[] => [
  {
    datapointId: 'dp-fall-001',
    name: 'Fall Detector',
    value,
    sfeType: 'SFE_State_Fall',
    deviceType: 'SF_FallDetector',
  },
];

const buildPresenceDatapoint = (value: string): DatapointValue[] => [
  {
    datapointId: 'dp-presence-001',
    name: 'Presence Sensor',
    value,
    sfeType: 'SFE_State_Presence',
    deviceType: 'SF_Access',
  },
];

describe('WardFalls', () => {
  let strategy: WardFalls;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataForPlant: jest.fn(),
      getDataForWard: jest.fn(),
      getAlarmsForWard: jest.fn(),
      getDataForSensor: jest.fn(),
    };
    strategy = new WardFalls(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getDataForWard.mockResolvedValue(new Map());

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getSeries()).toHaveLength(0);
  });

  it('should detect a Fall when it changes from NoFall to Fall', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildFallDatapoint('NoFall')],
      [`${yesterday}T09:00:00.000Z`, buildFallDatapoint('Fall')],
    ]);

    mockPort.getDataForWard.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(1);
  });

  it('should not count a fall if the value stays to Fall', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildFallDatapoint('Fall')],
      [`${yesterday}T09:00:00.000Z`, buildFallDatapoint('Fall')],
      [`${yesterday}T10:00:00.000Z`, buildFallDatapoint('Fall')],
    ]);

    mockPort.getDataForWard.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toHaveLength(0);
  });

  it('should count two separate falls on the same day', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildFallDatapoint('NoFall')],
      [`${yesterday}T09:00:00.000Z`, buildFallDatapoint('Fall')],
      [`${yesterday}T10:00:00.000Z`, buildFallDatapoint('NoFall')],
      [`${yesterday}T11:00:00.000Z`, buildFallDatapoint('Fall')],
    ]);

    mockPort.getDataForWard.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(2);
  });

  it('should correctly aggregate falls per day', async () => {
    const snapshots = new Map([
      [`${twoDaysAgo}T08:00:00.000Z`, buildFallDatapoint('NoFall')],
      [`${twoDaysAgo}T09:00:00.000Z`, buildFallDatapoint('Fall')],
      [`${twoDaysAgo}T10:00:00.000Z`, buildFallDatapoint('NoFall')],
      [`${yesterday}T08:00:00.000Z`, buildFallDatapoint('NoFall')],
      [`${yesterday}T09:00:00.000Z`, buildFallDatapoint('Fall')],
      [`${yesterday}T10:00:00.000Z`, buildFallDatapoint('NoFall')],
      [`${yesterday}T11:00:00.000Z`, buildFallDatapoint('Fall')],
    ]);

    mockPort.getDataForWard.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toHaveLength(2);
    expect(result.getLabels()[0]).toBe(twoDaysAgo);
    expect(result.getLabels()[1]).toBe(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(1);
    expect(result.getSeries()[0].getData()[1]).toBe(2);
  });

  it('should not consider a fall if the datapoint is not SFE_State_Fall', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildPresenceDatapoint('Detected')],
    ]);

    mockPort.getDataForWard.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toHaveLength(0);
  });
});
