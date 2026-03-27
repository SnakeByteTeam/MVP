import { WardAlarmsFrequency } from './ward-alarms-frequency';
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

describe('WardAlarmsFrequency', () => {
  let strategy: WardAlarmsFrequency;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataByPlantId: jest.fn(),
      getDataByWardId: jest.fn(),
      getAlarmsByWardId: jest.fn(),
      getDataBySensorId: jest.fn(),
    };
    strategy = new WardAlarmsFrequency(mockPort);
  });

  it('should return an empty Plot if there are no alarms', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValue(new Map());

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-alarms-frequency', '1'),
    );

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getData()).toHaveLength(0);
  });

  it('should return the number of alarms for a single day', async () => {
    mockPort.getAlarmsByWardId.mockResolvedValue(new Map([[yesterday, 3]]));

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-alarms-frequency', '1'),
    );

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getData()[0]).toBe('3');
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

    expect(result.getLabels()).toHaveLength(3);
    expect(result.getLabels()[0]).toBe(threeDaysAgo);
    expect(result.getLabels()[1]).toBe(twoDaysAgo);
    expect(result.getLabels()[2]).toBe(yesterday);
    expect(result.getData()[0]).toBe('1');
    expect(result.getData()[1]).toBe('4');
    expect(result.getData()[2]).toBe('2');
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

    expect(result.getLabels()[0]).toBe(threeDaysAgo);
    expect(result.getLabels()[1]).toBe(twoDaysAgo);
    expect(result.getLabels()[2]).toBe(yesterday);
  });
});
