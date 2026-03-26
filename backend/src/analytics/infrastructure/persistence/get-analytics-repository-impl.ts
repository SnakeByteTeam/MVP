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
    const { plantId, wardId, startDate, alarms, onlyResolved, sensorId } =
      JSON.parse(params) as {
        plantId?: string;
        wardId?: string;
        startDate?: string;
        alarms?: boolean;
        onlyResolved?: boolean;
        sensorId?: string;
      };

    if (alarms && wardId) {
      const { rows } = await this.pool.query<{
        day: Date;
        alarm_count: string;
      }>(
        `SELECT
         DATE(ae.activation_time) AS day,
         COUNT(*) AS alarm_count
       FROM alarm_event ae
       JOIN alarm_rule ar ON ar.id = ae.alarm_id
       JOIN plant p        ON p.id  = ar.plant_id
       WHERE p.ward_id = $1
         AND ae.activation_time >= $2
         ${onlyResolved ? 'AND ae.resolution_time IS NOT NULL' : ''}
       GROUP BY DATE(ae.activation_time)
       ORDER BY day ASC`,
        [wardId, startDate],
      );
      return rows;
    }

    if (plantId) {
      const { rows } = await this.pool.query<{
        timestamp: string;
        datapoint_id: string;
        value: string;
        sfe_type: string;
        device_type: string;
      }>(
        `WITH latest_cache AS (
       SELECT DISTINCT ON (plant_id) data
       FROM structure_cache
       WHERE plant_id = $1
       ORDER BY plant_id, cached_at DESC
     ),
     dp_meta AS (
       SELECT
         dp->>'id'      AS datapoint_id,
         dp->>'sfeType' AS sfe_type,
         dev->>'type'   AS device_type
       FROM latest_cache
       JOIN LATERAL jsonb_array_elements(data->'rooms')    AS room ON TRUE
       JOIN LATERAL jsonb_array_elements(room->'devices')  AS dev  ON TRUE
       JOIN LATERAL jsonb_array_elements(dev->'datapoints') AS dp  ON TRUE
     )
     SELECT
       dh.timestamp,
       dh.datapoint_id,
       dh.value,
       m.sfe_type,
       m.device_type
     FROM datapoint_history dh
     JOIN dp_meta m ON m.datapoint_id = dh.datapoint_id
     WHERE dh.timestamp >= $2
     ORDER BY dh.timestamp ASC`,
        [plantId, startDate],
      );
      return rows;
    }

    if (wardId) {
      const { rows } = await this.pool.query<{
        timestamp: string;
        datapoint_id: string;
        value: string;
        sfe_type: string;
        device_type: string;
      }>(
        `WITH latest_cache AS (
       SELECT DISTINCT ON (plant_id) data
       FROM structure_cache
       WHERE plant_id IN (SELECT id FROM plant WHERE ward_id = $1)
       ORDER BY plant_id, cached_at DESC
     ),
     dp_meta AS (
       SELECT
         dp->>'id'      AS datapoint_id,
         dp->>'sfeType' AS sfe_type,
         dev->>'type'   AS device_type
       FROM latest_cache
       JOIN LATERAL jsonb_array_elements(data->'rooms')    AS room ON TRUE
       JOIN LATERAL jsonb_array_elements(room->'devices')  AS dev  ON TRUE
       JOIN LATERAL jsonb_array_elements(dev->'datapoints') AS dp  ON TRUE
     )
     SELECT
       dh.timestamp,
       dh.datapoint_id,
       dh.value,
       m.sfe_type,
       m.device_type
     FROM datapoint_history dh
     JOIN dp_meta m ON m.datapoint_id = dh.datapoint_id
     WHERE dh.timestamp >= $2
     ORDER BY dh.timestamp ASC`,
        [wardId, startDate],
      );
      return rows;
    }

    if (sensorId) {
      const { rows } = await this.pool.query<{
        timestamp: string;
        datapoint_id: string;
        value: string;
        sfe_type: string;
        device_type: string;
      }>(
        `WITH latest_cache AS (
       SELECT DISTINCT ON (plant_id) data
       FROM structure_cache
       ORDER BY plant_id, cached_at DESC
     ),
     dp_meta AS (
       SELECT
         dp->>'id'      AS datapoint_id,
         dp->>'sfeType' AS sfe_type,
         dev->>'type'   AS device_type
       FROM latest_cache
       JOIN LATERAL jsonb_array_elements(data->'rooms')    AS room ON TRUE
       JOIN LATERAL jsonb_array_elements(room->'devices')  AS dev  ON TRUE
       JOIN LATERAL jsonb_array_elements(dev->'datapoints') AS dp  ON dp->>'id' = $1
     )
     SELECT
       dh.timestamp,
       dh.datapoint_id,
       dh.value,
       m.sfe_type,
       m.device_type
     FROM datapoint_history dh
     JOIN dp_meta m ON m.datapoint_id = dh.datapoint_id
     WHERE dh.datapoint_id = $1
       AND dh.timestamp >= $2
     ORDER BY dh.timestamp ASC`,
        [sensorId, startDate],
      );
      return rows;
    }
    return [];
  }
}
