import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from 'src/database/database.module';
import { GetAnalyticsRepositoryPort } from 'src/analytics/application/repository/get-analytics-repository.interface';

@Injectable()
export class GetAnalyticsRepositoryImpl implements GetAnalyticsRepositoryPort {
  constructor(
    @Inject(PG_POOL)
    private readonly pool: Pool,
  ) {}

  async query(params: string): Promise<any> {
    const { datapointId, wardId, startDate, alarms, onlyResolved, sensorId } =
      JSON.parse(params) as {
        datapointId?: string;
        wardId?: string;
        startDate?: string;
        alarms?: boolean;
        onlyResolved?: boolean;
        sensorId?: string;
      };

    if (alarms && wardId) {
      const { rows } = await this.pool.query(
        `SELECT
        DATE(aa.activation_time) AS day,
        COUNT(*) AS alarm_count
        FROM alarm_event aa
        JOIN alarm_rule a ON a.id = aa.alarm_id
        WHERE a.ward_id = $1
        AND aa.activation_time >= $2
        ${onlyResolved ? 'AND aa.resolution_time IS NOT NULL' : ''}
        GROUP BY DATE(aa.activation_time)
        ORDER BY day ASC`,
        [wardId, startDate],
      );
      return rows;
    }

    if (datapointId) {
      const { rows } = await this.pool.query(
        `SELECT cached_at AS timestamp, data
                FROM structure_cache
                WHERE plant_id = $1 AND cached_at >= $2
                ORDER BY cached_at ASC`,
        [datapointId, startDate],
      );
      return rows;
    }

    if (wardId) {
      const { rows } = await this.pool.query(
        `SELECT cached_at AS timestamp, data
                FROM structure_cache
                WHERE ward_id = $1 AND cached_at >= $2
                ORDER BY cached_at ASC`,
        [wardId, startDate],
      );
      return rows;
    }

    if (sensorId) {
      const { rows } = await this.pool.query(
        `SELECT cached_at AS timestamp, data
          FROM structure_cache
          WHERE cached_at >= $1
          AND data @? $2
          ORDER BY cached_at ASC`,
        [startDate, `$.rooms[*].devices[*] ? (@.id == "${sensorId}")`],
      );
      return rows;
    }

    return [];
  }
}
