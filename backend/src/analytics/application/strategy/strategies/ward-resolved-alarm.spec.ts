import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { WardResolvedAlarm } from './ward-resolved-alarm';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);

const toDay = (d: Date) => d.toISOString().slice(0, 10);

describe('WardResolvedAlarm', () => {
  let strategy: WardResolvedAlarm;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataByDatapointId: jest.fn(),
      getDataByWardId: jest.fn(),
      getAlarmsByWardId: jest.fn(),
      getDataBySensorId: jest.fn(),
    };
    strategy = new WardResolvedAlarm(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValue(new Map());

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.labels).toHaveLength(0);
    expect(result.data).toHaveLength(0);
  });

  it('should return sent and resolved alarms for the same day', async () => {
    // Resolved by day
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([[toDay(yesterday), 2]]),
    );

    // Sent by day
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([[toDay(yesterday), 3]]),
    );

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.labels).toContain(toDay(yesterday));
    expect(result.data[0]).toBe('3');
    expect(result.series?.resolved[0]).toBe('2');
  });

  it('should return 0 for resolved if no alarms were resolved that day', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map());
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([[toDay(yesterday), 5]]),
    );

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.labels).toContain(toDay(yesterday));
    expect(result.data[0]).toBe('5');
    expect(result.series?.resolved[0]).toBe('0');
  });

  it('should return 0 for sent if no alarms were sent that day', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([[toDay(yesterday), 5]]),
    );
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map());

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.labels).toContain(toDay(yesterday));
    expect(result.data[0]).toBe('0');
    expect(result.series?.resolved[0]).toBe('5');
  });

  it('should correctly aggregate alarms over multiple days', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([
        [toDay(threeDaysAgo), 1],
        [toDay(twoDaysAgo), 3],
        [toDay(yesterday), 2],
      ]),
    );
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([
        [toDay(threeDaysAgo), 2],
        [toDay(twoDaysAgo), 4],
        [toDay(yesterday), 3],
      ]),
    );

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.labels).toHaveLength(3);
    expect(result.labels[0]).toBe(toDay(threeDaysAgo));
    expect(result.labels[1]).toBe(toDay(twoDaysAgo));
    expect(result.labels[2]).toBe(toDay(yesterday));

    expect(result.data[0]).toBe('2');
    expect(result.data[1]).toBe('4');
    expect(result.data[2]).toBe('3');

    expect(result.series?.resolved[0]).toBe('1');
    expect(result.series?.resolved[1]).toBe('3');
    expect(result.series?.resolved[2]).toBe('2');
  });

  it('should call getAlarmsByWardId twice — once for resolved and once for sent', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValue(new Map());

    await strategy.execute(new GetAnalyticsCmd('ward-resolved-alarm', '1'));

    expect(mockPort.getAlarmsByWardId).toHaveBeenCalledTimes(2);
    expect(mockPort.getAlarmsByWardId).toHaveBeenCalledWith(
      '1',
      expect.any(Date),
      true,
    );
    expect(mockPort.getAlarmsByWardId).toHaveBeenCalledWith(
      '1',
      expect.any(Date),
      false,
    );
  });

  it('resolved alarms should never exceed sent alarms', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([[toDay(yesterday), 2]]),
    );
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([[toDay(yesterday), 3]]),
    );

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    const sent = parseInt(result.data[0]);
    const resolved = parseInt(result.series?.resolved[0] ?? '0');

    expect(resolved).toBeLessThanOrEqual(sent);
  });
});
