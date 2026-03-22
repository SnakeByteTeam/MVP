export interface GetAnalyticsPort {
  getDataByDatapointId(
    datapointId: string,
    startDate: Date,
  ): Promise<Map<string, any>>;
  getDataByWardId(wardId: string, startDate: Date): Promise<Map<string, any>>;
  getAlarmsByWardId(
    wardId: string,
    startDate: Date,
    onlyResolved: boolean,
  ): Promise<Map<string, any>>;
  getDataBySensorId(
    sensorId: string,
    startDate: Date,
  ): Promise<Map<string, any>>;
}

export const GET_ANALYTICS_PORT = 'GET_ANALYTICS_PORT';
