import { Injectable, Inject } from '@nestjs/common';
import { GetAnalyticsPort } from 'src/analytics/application/ports/out/get-analytics.port';
import { GetAnalyticsRepositoryPort } from 'src/analytics/application/repository/get-analytics-repository.interface';
import { DatapointRow } from 'src/analytics/domain/datapoint-row.model';
import { DatapointValue } from 'src/analytics/domain/datapoint-value.model';

@Injectable()
export class GetAnalyticsData implements GetAnalyticsPort {
  constructor(
    @Inject('GET_ANALYTICS_REPOSITORY')
    private readonly repository: GetAnalyticsRepositoryPort,
  ) {}

  async getDataForPlant(
    plantId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>> {
    const params = JSON.stringify({ plantId, startDate });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  async getDataForWard(
    wardId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>> {
    const params = JSON.stringify({ wardId, startDate });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  async getAlarmsForWard(
    wardId: string,
    startDate: Date,
    onlyResolved: boolean,
  ): Promise<Map<string, number>> {
    const params = JSON.stringify({
      wardId,
      startDate,
      alarms: true,
      onlyResolved,
    });
    const result = await this.repository.query(params);
    const map = new Map<string, number>();
    for (const row of result as { day: Date | string; alarm_count: string }[]) {
      const day =
        row.day instanceof Date
          ? row.day.toISOString().slice(0, 10)
          : String(row.day);
      map.set(day, Number.parseInt(row.alarm_count));
    }
    return map;
  }

  async getDataForSensor(
    plantId: string,
    startDate: Date,
  ): Promise<Map<string, DatapointValue[]>> {
    const params = JSON.stringify({ plantId, startDate, sensor: true });
    const result = await this.repository.query(params);
    return this.toMap(result);
  }

  private toMap(rows: DatapointRow[]): Map<string, DatapointValue[]> {
    const map = new Map<string, DatapointValue[]>();
    for (const row of rows) {
      const key = new Date(row.timestamp).toISOString();
      const existing: DatapointValue[] = map.get(key) ?? [];
      existing.push({
        datapointId: row.datapoint_id,
        name: row.name,
        value: row.value,
        sfeType: row.sfe_type,
        deviceType: row.device_type,
      });
      map.set(key, existing);
    }
    return map;
  }
}
