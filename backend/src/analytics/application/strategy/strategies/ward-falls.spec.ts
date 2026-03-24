import { WardFalls } from './ward-falls';
import { GetAnalyticsPort } from '../../ports/out/get-analytics.port';
import { GetAnalyticsCmd } from '../../commands/get-analytics.cmd';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);
const toDay = (d: Date) => d.toISOString().slice(0, 10);

const buildSnapshot = (timestamp: string, fallValue: string) => {
  return [
    timestamp,
    {
      id: 'plant-001',
      name: 'Appartamento Test',
      rooms: [
        {
          id: 'room-001',
          name: 'Bagno',
          devices: [
            {
              id: 'dev-fall-001',
              name: 'Sensore Caduta',
              type: 'SF_FallDetector',
              subType: 'SS_FallDetector',
              datapoints: [
                {
                  id: 'dp-fall-001',
                  name: 'SFE_State_Fall',
                  readable: true,
                  writable: false,
                  valueType: 'string',
                  enum: ['NoFall', 'Fall'],
                  sfeType: 'SFE_State_Fall',
                  value: fallValue,
                },
              ],
            },
          ],
        },
      ],
    },
  ] as [string, unknown];
};

describe('WardFalls', () => {
  let strategy: WardFalls;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataByDatapointId: jest.fn(),
      getDataByWardId: jest.fn(),
      getAlarmsByWardId: jest.fn(),
      getDataBySensorId: jest.fn(),
    };
    strategy = new WardFalls(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getDataByWardId.mockResolvedValue(new Map());

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-falls', '1'),
    );

    expect(result.labels).toHaveLength(0);
    expect(result.data).toHaveLength(0);
  });

  it('should detect a Fall when it changes from NoFall to Fall', async () => {
    const snapshots = new Map([
      buildSnapshot(`${toDay(yesterday)}T08:00:00.000Z`, 'NoFall'),
      buildSnapshot(`${toDay(yesterday)}T09:00:00.000Z`, 'Fall'),
    ]);

    mockPort.getDataByWardId.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-falls', '1'),
    );

    expect(result.labels).toContain(toDay(yesterday));
    expect(result.data[0]).toBe('1');
  });

  it('should not count a fall if the value stays to Fall', async () => {
    const snapshots = new Map([
      buildSnapshot(`${toDay(yesterday)}T08:00:00.000Z`, 'Fall'),
      buildSnapshot(`${toDay(yesterday)}T09:00:00.000Z`, 'Fall'),
      buildSnapshot(`${toDay(yesterday)}T10:00:00.000Z`, 'Fall'),
    ]);

    mockPort.getDataByWardId.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-falls', '1'),
    );

    expect(result.labels).toHaveLength(0);
  });

  it('should count two separate falls on the same day', async () => {
    const snapshots = new Map([
      buildSnapshot(`${toDay(yesterday)}T08:00:00.000Z`, 'NoFall'),
      buildSnapshot(`${toDay(yesterday)}T09:00:00.000Z`, 'Fall'),
      buildSnapshot(`${toDay(yesterday)}T10:00:00.000Z`, 'NoFall'),
      buildSnapshot(`${toDay(yesterday)}T11:00:00.000Z`, 'Fall'),
    ]);

    mockPort.getDataByWardId.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-falls', '1'),
    );

    expect(result.labels).toContain(toDay(yesterday));
    expect(result.data[0]).toBe('2');
  });

  it('should correctly aggregate falls per day', async () => {
    const snapshots = new Map([
      buildSnapshot(`${toDay(twoDaysAgo)}T08:00:00.000Z`, 'NoFall'),
      buildSnapshot(`${toDay(twoDaysAgo)}T09:00:00.000Z`, 'Fall'),
      buildSnapshot(`${toDay(twoDaysAgo)}T10:00:00.000Z`, 'NoFall'),
      buildSnapshot(`${toDay(yesterday)}T08:00:00.000Z`, 'NoFall'),
      buildSnapshot(`${toDay(yesterday)}T09:00:00.000Z`, 'Fall'),
      buildSnapshot(`${toDay(yesterday)}T10:00:00.000Z`, 'NoFall'),
      buildSnapshot(`${toDay(yesterday)}T11:00:00.000Z`, 'Fall'),
    ]);

    mockPort.getDataByWardId.mockResolvedValue(snapshots);

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-falls', '1'),
    );

    expect(result.labels).toHaveLength(2);
    expect(result.labels[0]).toBe(toDay(twoDaysAgo));
    expect(result.labels[1]).toBe(toDay(yesterday));
    expect(result.data[0]).toBe('1');
    expect(result.data[1]).toBe('2');
  });

  it('should not consider a fall if the datapoint is not SFE_State_Fall', async () => {
    const snapshots = new Map([
      [
        `${toDay(yesterday)}T08:00:00.000Z`,
        {
          id: 'plant-001',
          name: 'Appartamento Test',
          rooms: [
            {
              id: 'room-001',
              name: 'Bagno',
              devices: [
                {
                  id: 'dev-presence-001',
                  name: 'Sensore Presenza',
                  type: 'SF_Access',
                  subType: 'SS_Access_RadarDetector',
                  datapoints: [
                    {
                      id: 'dp-presence-001',
                      name: 'SFE_State_Presence',
                      readable: true,
                      writable: false,
                      valueType: 'string',
                      enum: ['NotDetected', 'Detected'],
                      sfeType: 'SFE_State_Presence',
                      value: 'Detected',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    ]);

    mockPort.getDataByWardId.mockResolvedValue(
      snapshots as Map<string, unknown>,
    );

    const result = await strategy.execute(
      new GetAnalyticsCmd('ward-falls', '1'),
    );

    expect(result.labels).toHaveLength(0);
  });
});
