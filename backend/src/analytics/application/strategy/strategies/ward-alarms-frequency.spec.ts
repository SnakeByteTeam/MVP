import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { WardAlarmsFrequency } from './ward-alarms-frequency';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};
const yesterday = toISO(1);
const twoDaysAgo = toISO(2);
const threeDaysAgo = toISO(3);

describe('WardAlarmsFrequency', () => {
  let strategy: WardAlarmsFrequency;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataByDatapointId: jest.fn(),
      getDataByWardId: jest.fn(),
      getAlarmsByWardId: jest.fn(),
      getDataBySensorId: jest.fn(),
    };
    strategy = new WardAlarmsFrequency(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValue(new Map());

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-alarms-frequency', '1'),
    );

    expect(result.labels).toHaveLength(0);
    expect(result.data).toHaveLength(0);
  });
  it('should return the number of alarms for a single day', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValue(new Map([[yesterday, 3]]));

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-alarms-frequency', '1'),
    );

    expect(result.labels).toContain(yesterday);
    expect(result.data[0]).toBe('3');
  });

  it('should correctly aggregate alarms over multiple days', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValue(
      new Map([
        [threeDaysAgo, 1],
        [twoDaysAgo, 4],
        [yesterday, 2],
      ]),
    );

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-alarms-frequency', '1'),
    );

    expect(result.labels).toHaveLength(3);
    expect(result.labels[0]).toBe(threeDaysAgo);
    expect(result.labels[1]).toBe(twoDaysAgo);
    expect(result.labels[2]).toBe(yesterday);
    expect(result.data[0]).toBe('1');
    expect(result.data[1]).toBe('4');
    expect(result.data[2]).toBe('2');
  });

  it('should call getAlarmsByWardId with onlyResolved=false', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValue(new Map());

    await strategy.execute(new GetAnalyticsCmd('ward-alarms-frequency', '1'));

    expect(mockPort.getAlarmsByWardId).toHaveBeenCalledTimes(1);
    expect(mockPort.getAlarmsByWardId).toHaveBeenCalledWith(
      '1',
      expect.any(Date),
      false,
    );
  });

  it('should return labels sorted by date ascending', async () => {
    // Map non ordinata intenzionalmente
    mockPort.getAlarmsByWardId.mockResolvedValue(
      new Map([
        [yesterday, 2],
        [threeDaysAgo, 5],
        [twoDaysAgo, 3],
      ]),
    );

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-alarms-frequency', '1'),
    );

    expect(result.labels[0]).toBe(threeDaysAgo);
    expect(result.labels[1]).toBe(twoDaysAgo);
    expect(result.labels[2]).toBe(yesterday);
  });
});
