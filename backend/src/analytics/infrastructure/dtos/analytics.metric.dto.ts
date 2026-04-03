export interface AnalyticsMetricConfig {
  title: string;
  metric: string;
  unit: string;
  sfeType?: string;
}

export const AnalyticsMetric = {
  PLANT_CONSUMPTION: {
    title: 'Consumo energetico di impianto',
    metric: 'plant-consumption',
    unit: 'Wh',
    sfeType: 'SFE_State_OnOff',
  },

  PLANT_ANOMALIES: {
    title: 'Anomalie di impianto',
    metric: 'plant-anomalies',
    unit: 'anomalie',
  },

  THERMOSTAT_TEMPERATURE: {
    title: 'Variazione e cambio di temperatura di impianto',
    metric: 'thermostat-temperature',
    unit: '°C',
    sfeType: 'SFE_State_Temperature',
  },

  SENSOR_PRESENCE: {
    title: 'Rilevamento di presenza',
    metric: 'sensor-presence',
    unit: 'events',
    sfeType: 'SFE_State_Presence',
  },

  SENSOR_LONG_PRESENCE: {
    title: 'Rilevamento di presenza prolungata',
    metric: 'sensor-long-presence',
    unit: 'events',
    sfeType: 'SFE_State_Presence',
  },

  WARD_ALARMS_FREQUENCY: {
    title: 'Frequenza degli allarmi rilevati nel reparto',
    metric: 'ward-alarms-frequency',
    unit: 'allarmi',
  },

  WARD_FALLS: {
    title: 'Frequenza delle cadute rilevate nel reparto',
    metric: 'ward-falls',
    unit: 'allarmi',
    sfeType: 'SFE_State_ManDown',
  },

  WARD_RESOLVED_ALARM: {
    title: 'Allarmi inviati e risolti nel reparto',
    metric: 'ward-resolved-alarm',
    unit: 'allarmi',
  },
} as const satisfies Record<string, AnalyticsMetricConfig>;

export type AnalyticsMetricKey = keyof typeof AnalyticsMetric;
