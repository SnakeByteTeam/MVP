import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { AnalyticsModule, ANALYTICS_STRATEGIES_TOKEN } from 'src/analytics/analytics.module';

type FactoryProvider = {
  provide: unknown;
  useFactory?: (...args: unknown[]) => unknown;
};

describe('AnalyticsModule', () => {
  it('espone il token ANALYTICS_STRATEGIES_TOKEN', () => {
    expect(ANALYTICS_STRATEGIES_TOKEN).toBe('ANALYTICS_STRATEGIES');
  });

  it('dichiara providers nel metadata del modulo', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AnalyticsModule) as unknown[];

    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBeGreaterThan(0);
  });

  it('factory di ANALYTICS_STRATEGIES_TOKEN costruisce la mappa attesa', () => {
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AnalyticsModule) as FactoryProvider[];
    const strategyMapProvider = providers.find(
      (provider) => provider && provider.provide === ANALYTICS_STRATEGIES_TOKEN,
    );

    expect(strategyMapProvider).toBeDefined();
    expect(typeof strategyMapProvider?.useFactory).toBe('function');

    const plantConsumption = { execute: jest.fn() };
    const plantAnomalies = { execute: jest.fn() };
    const thermostatTemperature = { execute: jest.fn() };
    const sensorLongPresence = { execute: jest.fn() };
    const sensorPresence = { execute: jest.fn() };
    const wardAlarmsFrequency = { execute: jest.fn() };
    const wardFalls = { execute: jest.fn() };
    const wardResolvedAlarm = { execute: jest.fn() };

    const strategyMap = strategyMapProvider?.useFactory?.(
      [plantConsumption, plantAnomalies, thermostatTemperature],
      [sensorLongPresence, sensorPresence],
      [wardAlarmsFrequency, wardFalls, wardResolvedAlarm],
    ) as Map<string, unknown>;

    expect(strategyMap).toBeInstanceOf(Map);
    expect(strategyMap.get('plant-consumption')).toBe(plantConsumption);
    expect(strategyMap.get('plant-anomalies')).toBe(plantAnomalies);
    expect(strategyMap.get('sensor-long-presence')).toBe(sensorLongPresence);
    expect(strategyMap.get('sensor-presence')).toBe(sensorPresence);
    expect(strategyMap.get('thermostat-temperature')).toBe(thermostatTemperature);
    expect(strategyMap.get('ward-alarms-frequency')).toBe(wardAlarmsFrequency);
    expect(strategyMap.get('ward-falls')).toBe(wardFalls);
    expect(strategyMap.get('ward-resolved-alarm')).toBe(wardResolvedAlarm);
  });
});
