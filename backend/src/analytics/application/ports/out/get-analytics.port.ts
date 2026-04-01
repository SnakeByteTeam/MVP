import { DatapointValue } from 'src/analytics/domain/datapoint-value.model';

export interface GetAnalyticsPort {
  getDataForPlant(
    plantId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>>;
  getDataForWard(
    wardId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>>;
  getAlarmsForWard(
    wardId: string,
    startDate: Date,
    onlyResolved: boolean,
  ): Promise<Map<string, number>>;
  getDataForSensor(
    sensorId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>>;
}

export const GET_ANALYTICS_PORT = 'GET_ANALYTICS_PORT';
