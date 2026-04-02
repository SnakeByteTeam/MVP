import { PlantConsumption } from './plant-consumption';
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

const buildLightDatapoint = (value: 'On' | 'Off'): DatapointValue[] => [
  {
    datapointId: 'dp-light-001-onoff',
    name: 'Light OnOff',
    value,
    sfeType: 'SFE_State_OnOff',
    deviceType: 'SF_Light',
  },
];

describe('PlantConsumption', () => {
  let strategy: PlantConsumption;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataForPlant: jest.fn(),
      getDataForWard: jest.fn(),
      getAlarmsForWard: jest.fn(),
      getDataForSensor: jest.fn(),
    };
    strategy = new PlantConsumption(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getDataForPlant.mockResolvedValue(new Map());

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getSeries()).toHaveLength(0);
  });

  it('should calculate consumption when light is On', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildLightDatapoint('On')],
      [`${yesterday}T10:00:00.000Z`, buildLightDatapoint('Off')],
    ]);

    mockPort.getDataForPlant.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    // 10W * 2h = 20Wh
    expect(result.getLabels()).toContain(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(20);
  });

  it('should not calculate consumption when light is Off', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildLightDatapoint('Off')],
      [`${yesterday}T10:00:00.000Z`, buildLightDatapoint('Off')],
    ]);

    mockPort.getDataForPlant.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toContain(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(0);
  });

  it('should correctly aggregate consumption over multiple days', async () => {
    const snapshots = new Map([
      [`${twoDaysAgo}T08:00:00.000Z`, buildLightDatapoint('On')],
      [`${twoDaysAgo}T10:00:00.000Z`, buildLightDatapoint('Off')],
      [`${yesterday}T08:00:00.000Z`, buildLightDatapoint('On')],
      [`${yesterday}T12:00:00.000Z`, buildLightDatapoint('Off')],
    ]);

    mockPort.getDataForPlant.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(2);
    expect(result.getLabels()[0]).toBe(twoDaysAgo);
    expect(result.getLabels()[1]).toBe(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(20);
    expect(result.getSeries()[0].getData()[1]).toBe(40);
  });

  it('should not consider non-light datapoints', async () => {
    const snapshots = new Map([
      [
        `${yesterday}T08:00:00.000Z`,
        [
          {
            datapointId: 'dp-thermo-001-hvac',
            name: 'HVAC Mode',
            value: 'Heating',
            sfeType: 'SFE_State_HVACMode',
            deviceType: 'SF_Thermostat',
          },
        ],
      ],
      [
        `${yesterday}T10:00:00.000Z`,
        [
          {
            datapointId: 'dp-thermo-001-hvac',
            name: 'HVAC Mode',
            value: 'Off',
            sfeType: 'SFE_State_HVACMode',
            deviceType: 'SF_Thermostat',
          },
        ],
      ],
    ]);

    mockPort.getDataForPlant.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getSeries()[0].getData()[0]).toBe(0);
  });
});
