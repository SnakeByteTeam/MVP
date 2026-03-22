import { Injectable, Inject } from '@nestjs/common';
import { GetAnalyticsPort } from 'src/analytics/application/ports/out/get-analytics.port';
import { GetAnalyticsRepositoryPort } from 'src/analytics/application/repository/get-analytics-repository.interface';

@Injectable()
export class GetAnalyticsData implements GetAnalyticsPort {
  constructor(
    @Inject('READ_TIMESERIES_REPOSITORY_PORT')
    private readonly repository: GetAnalyticsRepositoryPort,
  ) {}

  async getDataByDatapointId(
    datapointId: string,
    startDate: Date,
  ): Promise<Map<string, any>> {
    const params = JSON.stringify({ datapointId, startDate });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  async getDataByWardId(
    wardId: string,
    startDate: Date,
  ): Promise<Map<string, any>> {
    const params = JSON.stringify({ wardId, startDate });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  async getAlarmsByWardId(
    wardId: string,
    startDate: Date,
    onlyResolved: boolean,
  ): Promise<Map<string, any>> {
    const params = JSON.stringify({
      wardId,
      startDate,
      alarms: true,
      onlyResolved,
    });
    const result = await this.repository.query(params);
    const map = new Map<string, number>();
    for (const row of result) {
      const day =
        row.day instanceof Date
          ? row.day.toISOString().slice(0, 10)
          : String(row.day);
      map.set(day, parseInt(row.alarm_count));
    }
    return map;
  }

  async getDataBySensorId(
    sensorId: string,
    startDate: Date,
  ): Promise<Map<string, any>> {
    const params = JSON.stringify({ sensorId, startDate });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  private toMap(rows: any[]): Map<string, any> {
    const map = new Map<string, any>();
    for (const row of rows) {
      map.set(new Date(row.timestamp).toISOString(), row.data);
    }
    return map;
  }
}
