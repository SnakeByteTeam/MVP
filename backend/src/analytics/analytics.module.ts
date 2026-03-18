import { Module } from '@nestjs/common';
import { AnalyticsController } from './adapters/in/analytics.controller';
import { AnalyticsService } from './application/services/analytics.service';
import { TimeseriesRepository } from './adapters/out/timeseries/timeseries-repository';
import { PlantConsumption } from './application/strategy/strategies/plant-consumption';
import { PlantAnomalies } from './application/strategy/strategies/plant-anomalies';
import { SensorLongPresence } from './application/strategy/strategies/sensor-long-presence';
import { SensorPresence } from './application/strategy/strategies/sensor-presence';
import { ThermostatTemperature } from './application/strategy/strategies/thermostat-temperature';
import { WardAlarmsFrequency } from './application/strategy/strategies/ward-alarms-frequency';
import { WardFalls } from './application/strategy/strategies/ward-falls';
import { WardResolvedAlarm } from './application/strategy/strategies/ward-resolved-alarm';
import { GetTimeseriesData } from './adapters/out/timeseries/get-timeseries-data';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, TimeseriesRepository, PlantConsumption, PlantAnomalies, SensorLongPresence, SensorPresence, ThermostatTemperature, WardAlarmsFrequency, WardFalls, WardResolvedAlarm,
  {
    provide: 'GET_ANALYTICS_USECASE',
    useClass: AnalyticsService
  },
  {
    provide: 'GET_ANALYTICS_PORT',
    useClass: GetTimeseriesData,
  },
  {
    provide: 'READ_TIMESERIES_REPOSITORY_PORT',
    useClass: TimeseriesRepository,
  }
]
})
export class AnalyticsModule {}
