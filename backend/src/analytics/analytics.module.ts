import { Module } from '@nestjs/common';
import { AnalyticsController } from './adapters/in/analytics.controller';
import { AnalyticsService } from './application/services/analytics.service';
import { GetAnalyticsRepositoryImpl } from './infrastructure/persistence/get-analytics-repository-impl';
import { PlantConsumption } from './application/strategy/strategies/plant-consumption';
import { PlantAnomalies } from './application/strategy/strategies/plant-anomalies';
import { SensorLongPresence } from './application/strategy/strategies/sensor-long-presence';
import { SensorPresence } from './application/strategy/strategies/sensor-presence';
import { PlantThermostatTemperature } from './application/strategy/strategies/plant-thermostat-temperature';
import { WardAlarmsFrequency } from './application/strategy/strategies/ward-alarms-frequency';
import { WardFalls } from './application/strategy/strategies/ward-falls';
import { WardResolvedAlarm } from './application/strategy/strategies/ward-resolved-alarm';
import { GetAnalyticsData } from './adapters/out/get-analytics-data.adapter';
import { AnalyticsStrategy } from './application/strategy/analytics.strategy';

@Module({
  controllers: [AnalyticsController],
  providers: [
    PlantConsumption,
    PlantAnomalies,
    SensorLongPresence,
    SensorPresence,
    PlantThermostatTemperature,
    WardAlarmsFrequency,
    WardFalls,
    WardResolvedAlarm,
    {
      provide: 'GET_ANALYTICS_PORT',
      useClass: GetAnalyticsData,
    },
    {
      provide: 'READ_TIMESERIES_REPOSITORY_PORT',
      useClass: GetAnalyticsRepositoryImpl,
    },
    {
      provide: 'GET_ANALYTICS_USECASE',
      useFactory: (
        plantConsumption: PlantConsumption,
        plantAnomalies: PlantAnomalies,
        sensorLongPresence: SensorLongPresence,
        sensorPresence: SensorPresence,
        thermostatTemperature: PlantThermostatTemperature,
        wardAlarmsFrequency: WardAlarmsFrequency,
        wardFalls: WardFalls,
        wardResolvedAlarm: WardResolvedAlarm,
      ): AnalyticsService => {
        const strategies = new Map<string, AnalyticsStrategy>([
          ['plant-consumption', plantConsumption],
          ['plant-anomalies', plantAnomalies],
          ['sensor-long-presence', sensorLongPresence],
          ['sensor-presence', sensorPresence],
          ['thermostat-temperature', thermostatTemperature],
          ['ward-alarms-frequency', wardAlarmsFrequency],
          ['ward-falls', wardFalls],
          ['ward-resolved-alarm', wardResolvedAlarm],
        ]);
        return new AnalyticsService(strategies);
      },
      inject: [
        PlantConsumption,
        PlantAnomalies,
        SensorLongPresence,
        SensorPresence,
        PlantThermostatTemperature,
        WardAlarmsFrequency,
        WardFalls,
        WardResolvedAlarm,
      ],
    },
  ],
})
export class AnalyticsModule {}
