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
      getDataForPlant: jest.fn(),
      getDataForWard: jest.fn(),
      getAlarmsForWard: jest.fn(),
      getDataForSensor: jest.fn(),
    };
    strategy = new WardResolvedAlarm(mockPort);
  });

  it('should return an empty Plot if there are no alarms', async () => {
    mockPort.getAlarmsForWard.mockResolvedValue(new Map());

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getSeries()).toHaveLength(0);
  });

  it('should return total and resolved alarms series for the same day', async () => {
    mockPort.getAlarmsForWard.mockResolvedValueOnce(new Map([[yesterday, 3]])); // total
    mockPort.getAlarmsForWard.mockResolvedValueOnce(new Map([[yesterday, 2]])); // resolved

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toContain(yesterday);

    const totalSeries = result.getSeries().find((s) => s.getId() === 'totali');
    const resolvedSeries = result
      .getSeries()
      .find((s) => s.getId() === 'risolti');

    expect(totalSeries?.getData()[0]).toBe(3);
    expect(resolvedSeries?.getData()[0]).toBe(2);
  });

  it('should return 0 for resolved if no alarms were resolved that day', async () => {
    mockPort.getAlarmsForWard.mockResolvedValueOnce(new Map([[yesterday, 5]])); // total
    mockPort.getAlarmsForWard.mockResolvedValueOnce(new Map()); // resolved

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toContain(yesterday);

    const totalSeries = result.getSeries().find((s) => s.getId() === 'totali');
    const resolvedSeries = result
      .getSeries()
      .find((s) => s.getId() === 'risolti');

    expect(totalSeries?.getData()[0]).toBe(5);
    expect(resolvedSeries?.getData()[0]).toBe(0);
  });

  it('should correctly aggregate alarms over multiple days', async () => {
    mockPort.getAlarmsForWard.mockResolvedValueOnce(
      new Map([
        [threeDaysAgo, 2],
        [twoDaysAgo, 4],
        [yesterday, 2],
      ]), // total
    );
    mockPort.getAlarmsForWard.mockResolvedValueOnce(
      new Map([
        [threeDaysAgo, 1],
        [twoDaysAgo, 3],
        [yesterday, 2],
      ]), // resolved
    );

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    expect(result.getLabels()).toHaveLength(3);
    expect(result.getLabels()[0]).toBe(threeDaysAgo);
    expect(result.getLabels()[1]).toBe(twoDaysAgo);
    expect(result.getLabels()[2]).toBe(yesterday);

    const totalSeries = result.getSeries().find((s) => s.getId() === 'totali')!;
    const resolvedSeries = result
      .getSeries()
      .find((s) => s.getId() === 'risolti')!;

    expect(totalSeries.getData()[0]).toBe(2);
    expect(totalSeries.getData()[1]).toBe(4);
    expect(totalSeries.getData()[2]).toBe(2);

    expect(resolvedSeries.getData()[0]).toBe(1);
    expect(resolvedSeries.getData()[1]).toBe(3);
    expect(resolvedSeries.getData()[2]).toBe(2);
  });

  it('should call getAlarmsForWard twice — once for total and once for resolved', async () => {
    mockPort.getAlarmsForWard.mockResolvedValue(new Map());

    await strategy.execute(new GetAnalyticsCmd('1'));

    expect(mockPort.getAlarmsForWard).toHaveBeenCalledTimes(2);
    expect(mockPort.getAlarmsForWard).toHaveBeenCalledWith(
      '1',
      expect.any(Date),
      false,
    );
    expect(mockPort.getAlarmsForWard).toHaveBeenCalledWith(
      '1',
      expect.any(Date),
      true,
    );
  });

  it('resolved alarms should never exceed total alarms', async () => {
    mockPort.getAlarmsForWard.mockResolvedValueOnce(new Map([[yesterday, 3]])); // total
    mockPort.getAlarmsForWard.mockResolvedValueOnce(new Map([[yesterday, 2]])); // resolved

    const result = await strategy.execute(new GetAnalyticsCmd('1'));

    const totalSeries = result.getSeries().find((s) => s.getId() === 'totali')!;
    const resolvedSeries = result
      .getSeries()
      .find((s) => s.getId() === 'risolti')!;

    expect(resolvedSeries.getData()[0]).toBeLessThanOrEqual(
      totalSeries.getData()[0],
    );
  });
});
