import { WardResolvedAlarm } from './ward-resolved-alarm';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';

const toISO = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const yesterday = toISO(1);
const twoDaysAgo = toISO(2);
const threeDaysAgo = toISO(3);

describe('WardResolvedAlarm', () => {
  let strategy: WardResolvedAlarm;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataByPlantId: jest.fn(),
      getDataByWardId: jest.fn(),
      getAlarmsByWardId: jest.fn(),
      getDataBySensorId: jest.fn(),
    };
    strategy = new WardResolvedAlarm(mockPort);
  });

  it('should return an empty Plot if there are no alarms', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map()); // risolti
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map()); // inviati

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getData()).toHaveLength(0);
  });

  it('should return sent and resolved alarms for the same day', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map([[yesterday, 2]]));
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map([[yesterday, 3]]));

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe('3');
    expect(result.getSeries()?.resolved[0]).toBe('2');
  });

  it('should return 0 for resolved if no alarms were resolved that day', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map());
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map([[yesterday, 5]]));

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe('5');
    expect(result.getSeries()?.resolved[0]).toBe('0');
  });

  it('should correctly aggregate alarms over multiple days', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([
        [threeDaysAgo, 1],
        [twoDaysAgo, 3],
        [yesterday, 2],
      ]), // risolti
    );
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(
      new Map([
        [threeDaysAgo, 2],
        [twoDaysAgo, 4],
        [yesterday, 2],
      ]), // inviati
    );

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    expect(result.getLabels()).toHaveLength(3);
    expect(result.getLabels()[0]).toBe(threeDaysAgo);
    expect(result.getLabels()[1]).toBe(twoDaysAgo);
    expect(result.getLabels()[2]).toBe(yesterday);

    expect(result.getData()[0]).toBe('2'); // inviati
    expect(result.getData()[1]).toBe('4');
    expect(result.getData()[2]).toBe('2');

    expect(result.getSeries()?.resolved[0]).toBe('1'); // risolti
    expect(result.getSeries()?.resolved[1]).toBe('3');
    expect(result.getSeries()?.resolved[2]).toBe('2');
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
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map([[yesterday, 2]]));
    mockPort.getAlarmsByWardId.mockResolvedValueOnce(new Map([[yesterday, 3]]));

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-resolved-alarm', '1'),
    );

    const sent = parseInt(result.getData()[0]);
    const resolved = parseInt(result.getSeries()?.resolved[0] ?? '0');

    expect(resolved).toBeLessThanOrEqual(sent);
  });
});
