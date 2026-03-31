import { Module } from '@nestjs/common';
import { AnalyticsController } from './adapters/in/analytics.controller';
import { AnalyticsService } from './application/services/analytics.service';
import { GetAnalyticsRepositoryImpl } from './infrastructure/persistence/get-analytics-repository-impl';
import { GetAnalyticsData } from './adapters/out/get-analytics-data.adapter';
import { GET_ANALYTICS_PORT } from './application/ports/out/get-analytics.port';
import { GET_ANALYTICS_USECASE } from './application/ports/in/get-analytics.usecase';
import { AnalyticsStrategy } from './application/strategy/analytics.strategy';

import { PlantConsumption } from './application/strategy/strategies/plant-consumption';
import { PlantAnomalies } from './application/strategy/strategies/plant-anomalies';
import { PlantThermostatTemperature } from './application/strategy/strategies/plant-thermostat-temperature';
import { SensorLongPresence } from './application/strategy/strategies/sensor-long-presence';
import { SensorPresence } from './application/strategy/strategies/sensor-presence';
import { WardAlarmsFrequency } from './application/strategy/strategies/ward-alarms-frequency';
import { WardFalls } from './application/strategy/strategies/ward-falls';
import { WardResolvedAlarm } from './application/strategy/strategies/ward-resolved-alarm';
import { GET_ANALYTICS_REPOSITORY } from './application/repository/get-analytics-repository.interface';
import {
  GET_SUGGESTION_USECASE,
  GetSuggestionUseCase,
} from './application/ports/in/get-suggestion.usecase';
import { SuggestionService } from './application/services/suggestion.service';
import { LLM_SUGGESTION_PORT } from './application/ports/out/llm-suggestion.port';
import { LLMSuggestionAdapter } from './adapters/out/llm-suggestion.adapter';
import { GROQ_CLIENT } from './infrastructure/groq/groq.client';
import { GroqClientImpl } from './infrastructure/groq/groq-client.impl';

const PLANT_STRATEGIES_TOKEN = 'PLANT_STRATEGIES';
const SENSOR_STRATEGIES_TOKEN = 'SENSOR_STRATEGIES';
const WARD_STRATEGIES_TOKEN = 'WARD_STRATEGIES';
export const ANALYTICS_STRATEGIES_TOKEN = 'ANALYTICS_STRATEGIES';

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
      provide: GET_ANALYTICS_USECASE,
      useFactory: (
        strategies: Map<string, AnalyticsStrategy>,
        suggestionUseCase: GetSuggestionUseCase,
      ) => new AnalyticsService(strategies, suggestionUseCase),
      inject: [ANALYTICS_STRATEGIES_TOKEN, GET_SUGGESTION_USECASE],
    },
    {
      provide: GET_SUGGESTION_USECASE,
      useClass: SuggestionService,
    },
    {
      provide: LLM_SUGGESTION_PORT,
      useClass: LLMSuggestionAdapter,
    },
    {
      provide: GROQ_CLIENT,
      useClass: GroqClientImpl,
    },
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
  ],
})
export class AnalyticsModule {}
