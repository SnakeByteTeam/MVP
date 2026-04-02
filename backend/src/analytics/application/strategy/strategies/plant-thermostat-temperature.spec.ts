import { PlantThermostatTemperature } from './plant-thermostat-temperature';
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

const buildTempDatapoint = (value: string): DatapointValue[] => [
  {
    datapointId: 'dp-thermo-001-temp',
    name: 'Temperature',
    value,
    sfeType: 'SFE_State_Temperature',
    deviceType: 'SF_Thermostat',
  },
];

describe('PlantThermostatTemperature', () => {
  let strategy: PlantThermostatTemperature;
  let mockPort: jest.Mocked<GetAnalyticsPort>;

  beforeEach(() => {
    mockPort = {
      getDataForPlant: jest.fn(),
      getDataForWard: jest.fn(),
      getAlarmsForWard: jest.fn(),
      getDataForSensor: jest.fn(),
    };
    strategy = new PlantThermostatTemperature(mockPort);
  });

  it('should return an empty Plot if there are no snapshots', async () => {
    mockPort.getDataForPlant.mockResolvedValue(new Map());

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(0);
    expect(result.getSeries()).toHaveLength(0);
  });

  it('should calculate daily average temperature', async () => {
    const snapshots = new Map([
      [`${yesterday}T08:00:00.000Z`, buildTempDatapoint('20.0')],
      [`${yesterday}T14:00:00.000Z`, buildTempDatapoint('22.0')],
      [`${yesterday}T20:00:00.000Z`, buildTempDatapoint('21.0')],
    ]);

    mockPort.getDataForPlant.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    // media: (20 + 22 + 21) / 3 = 21.0
    expect(result.getLabels()).toContain(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(21.0);
  });

  it('should correctly aggregate average temperature over multiple days', async () => {
    const snapshots = new Map([
      [`${twoDaysAgo}T08:00:00.000Z`, buildTempDatapoint('18.0')],
      [`${twoDaysAgo}T20:00:00.000Z`, buildTempDatapoint('20.0')], // media 19.0
      [`${yesterday}T08:00:00.000Z`, buildTempDatapoint('22.0')],
      [`${yesterday}T20:00:00.000Z`, buildTempDatapoint('24.0')], // media 23.0
    ]);

    mockPort.getDataForPlant.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(2);
    expect(result.getLabels()[0]).toBe(twoDaysAgo);
    expect(result.getLabels()[1]).toBe(yesterday);
    expect(result.getSeries()[0].getData()[0]).toBe(19.0);
    expect(result.getSeries()[0].getData()[1]).toBe(23.0);
  });

  it('should not consider non-temperature datapoints', async () => {
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
    ]);

    mockPort.getDataForPlant.mockResolvedValue(snapshots);

    const result = await strategy.execute(new GetAnalyticsCmd('plant-001'));

    expect(result.getLabels()).toHaveLength(0);
  });
});
