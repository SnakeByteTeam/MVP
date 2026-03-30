import { Injectable, Inject } from '@nestjs/common';
import { GetAnalyticsPort } from 'src/analytics/application/ports/out/get-analytics.port';
import { GetAnalyticsRepositoryPort } from 'src/analytics/application/repository/get-analytics-repository.interface';
import { DatapointRow } from 'src/analytics/domain/datapoint-row.model';

@Injectable()
export class GetAnalyticsData implements GetAnalyticsPort {
  constructor(
    @Inject('READ_TIMESERIES_REPOSITORY_PORT')
    private readonly repository: GetAnalyticsRepositoryPort,
  ) {}

  async getDataForPlant(
    plantId: string,
    startDate: Date,
  ): Promise<Map<string, any>> {
    const params = JSON.stringify({ plantId, startDate });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  async getDataForWard(
    wardId: string,
    startDate: Date,
  ): Promise<Map<string, any>> {
    const params = JSON.stringify({ wardId, startDate });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  async getAlarmsForWard(
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
      map.set(day, Number.parseInt(row.alarm_count));
    }
    return map;
  }

  async getDataForSensor(
    sensorId: string,
    startDate: Date,
  ): Promise<Map<string, any>> {
    const params = JSON.stringify({ sensorId, startDate });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  private toMap(rows: DatapointRow[]): Map<
    string,
    {
      datapointId: string;
      value: string;
      sfeType: string;
      deviceType: string;
    }[]
  > {
    const map = new Map<
      string,
      {
        datapointId: string;
        value: string;
        sfeType: string;
        deviceType: string;
      }[]
    >();
    for (const row of rows) {
      const key = new Date(row.timestamp).toISOString();
      const existing = map.get(key) ?? [];
      existing.push({
        datapointId: row.datapoint_id,
        value: row.value,
        sfeType: row.sfe_type,
        deviceType: row.device_type,
      });
      map.set(key, existing);
    }
    return map;
  }
}
