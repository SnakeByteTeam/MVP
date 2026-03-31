import { DatapointValue } from 'src/analytics/domain/datapoint-value.model';

export interface GetAnalyticsPort {
  getDataByPlantId(
    plantId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>>;
  getDataByWardId(
    wardId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>>;
  getAlarmsByWardId(
    wardId: string,
    startDate: Date,
    onlyResolved: boolean,
  ): Promise<Map<string, number>>;
  getDataBySensorId(
    sensorId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>>;
}

export const GET_ANALYTICS_PORT = 'GET_ANALYTICS_PORT';
