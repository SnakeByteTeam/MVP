import { Module } from '@nestjs/common';
import { AnalyticsController } from './adapters/in/analytics.controller';
import { AnalyticsService } from './application/services/analytics.service';
import { GetAnalyticsRepositoryImpl } from './infrastructure/persistence/get-analytics-repository-impl';
import { GetAnalyticsData } from './adapters/out/get-analytics-data.adapter';
import { GET_ANALYTICS_PORT } from './application/ports/out/get-analytics.port';
import { AnalyticsStrategy } from './application/strategy/analytics.strategy';

import { PlantConsumption } from './application/strategy/strategies/plant-consumption';
import { PlantAnomalies } from './application/strategy/strategies/plant-anomalies';
import { PlantThermostatTemperature } from './application/strategy/strategies/plant-thermostat-temperature';

import { SensorLongPresence } from './application/strategy/strategies/sensor-long-presence';
import { SensorPresence } from './application/strategy/strategies/sensor-presence';

import { WardAlarmsFrequency } from './application/strategy/strategies/ward-alarms-frequency';
import { WardFalls } from './application/strategy/strategies/ward-falls';
import { WardResolvedAlarm } from './application/strategy/strategies/ward-resolved-alarm';

const PLANT_STRATEGIES_TOKEN = 'PLANT_STRATEGIES';
const SENSOR_STRATEGIES_TOKEN = 'SENSOR_STRATEGIES';
const WARD_STRATEGIES_TOKEN = 'WARD_STRATEGIES';
const ANALYTICS_STRATEGIES_TOKEN = 'ANALYTICS_STRATEGIES';
const GET_ANALYTICS_REPOSITORY = 'GET_ANALYTICS_REPOSITORY';

@Module({
  controllers: [AnalyticsController],
  providers: [
    PlantConsumption,
    PlantAnomalies,
    PlantThermostatTemperature,
    SensorLongPresence,
    SensorPresence,
    WardAlarmsFrequency,
    WardFalls,
    WardResolvedAlarm,
    {
      provide: GET_ANALYTICS_PORT,
      useClass: GetAnalyticsData,
    },
    {
      provide: GET_ANALYTICS_REPOSITORY,
      useClass: GetAnalyticsRepositoryImpl,
    },
    {
      provide: PLANT_STRATEGIES_TOKEN,
      useFactory: (
        plantConsumption: PlantConsumption,
        plantAnomalies: PlantAnomalies,
        thermostatTemperature: PlantThermostatTemperature,
      ): AnalyticsStrategy[] => [
        plantConsumption,
        plantAnomalies,
        thermostatTemperature,
      ],
      inject: [PlantConsumption, PlantAnomalies, PlantThermostatTemperature],
    },
    {
      provide: SENSOR_STRATEGIES_TOKEN,
      useFactory: (
        sensorLongPresence: SensorLongPresence,
        sensorPresence: SensorPresence,
      ): AnalyticsStrategy[] => [sensorLongPresence, sensorPresence],
      inject: [SensorLongPresence, SensorPresence],
    },
    {
      provide: WARD_STRATEGIES_TOKEN,
      useFactory: (
        wardAlarmsFrequency: WardAlarmsFrequency,
        wardFalls: WardFalls,
        wardResolvedAlarm: WardResolvedAlarm,
      ): AnalyticsStrategy[] => [
        wardAlarmsFrequency,
        wardFalls,
        wardResolvedAlarm,
      ],
      inject: [WardAlarmsFrequency, WardFalls, WardResolvedAlarm],
    },
    {
      provide: ANALYTICS_STRATEGIES_TOKEN,
      useFactory: (
        plantStrategies: AnalyticsStrategy[],
        sensorStrategies: AnalyticsStrategy[],
        wardStrategies: AnalyticsStrategy[],
      ): Map<string, AnalyticsStrategy> => {
        const [plantConsumption, plantAnomalies, thermostatTemperature] =
          plantStrategies;
        const [sensorLongPresence, sensorPresence] = sensorStrategies;
        const [wardAlarmsFrequency, wardFalls, wardResolvedAlarm] =
          wardStrategies;

        return new Map<string, AnalyticsStrategy>([
          ['plant-consumption', plantConsumption],
          ['plant-anomalies', plantAnomalies],
          ['sensor-long-presence', sensorLongPresence],
          ['sensor-presence', sensorPresence],
          ['thermostat-temperature', thermostatTemperature],
          ['ward-alarms-frequency', wardAlarmsFrequency],
          ['ward-falls', wardFalls],
          ['ward-resolved-alarm', wardResolvedAlarm],
        ]);
      },
      inject: [
        PLANT_STRATEGIES_TOKEN,
        SENSOR_STRATEGIES_TOKEN,
        WARD_STRATEGIES_TOKEN,
      ],
    },
    {
      provide: 'GET_ANALYTICS_USECASE',
      useClass: AnalyticsService,
    },
  ],
})
export class AnalyticsModule {}
