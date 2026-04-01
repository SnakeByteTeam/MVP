import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from 'src/database/database.module';
import { FindDeviceByIdRepoPort } from 'src/device/application/repository/find-device-by-id.repository';
import { FindDeviceByPlantIdRepoPort } from 'src/device/application/repository/find-device-by-plant-id.repository';
import { DeviceEntity } from './entities/device.entity';
import { IngestTimeseriesRepoPort } from 'src/device/application/repository/ingest-timeseries.repository';

@Injectable()
export class DeviceRepositoryImpl
  implements
    FindDeviceByIdRepoPort,
    FindDeviceByPlantIdRepoPort,
    IngestTimeseriesRepoPort
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findById(id: string): Promise<DeviceEntity | null> {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query<{ device: DeviceEntity }>(
        `SELECT jsonb_path_query(
                      data,
                      '$.rooms[*].devices[*] ? (@.id == $deviceId)',
                      jsonb_build_object('deviceId', $1::text)
                  ) AS device
                  FROM plant;`,
        [id],
      );

      if (rows.length == 0) return null;

      const device: DeviceEntity = rows[0]?.device;
      return device;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    } finally {
      client.release();
    }
  }

  async findByPlantId(plantId: string): Promise<DeviceEntity[] | null> {
    const client = await this.pool.connect();

    try {
      const { rows } = await client.query<{ device: DeviceEntity }>(
        `SELECT jsonb_path_query(data, '$.rooms[*].devices[*]') AS device
              FROM plant
              WHERE id = $1`,
        [plantId],
      );

      if (rows.length == 0) return null;

      const devices: DeviceEntity[] = rows.map((row) => row.device);
      return devices;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    } finally {
      client.release();
    }
  }
  async ingestTimeseries(
    datapointId: string,
    value: string,
    timestamp: string,
  ): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO datapoint_history (timestamp, datapoint_id, value)
       VALUES ($1::TIMESTAMPTZ, $2::VARCHAR(128), $3::VARCHAR(50))
       ON CONFLICT (timestamp, datapoint_id) DO UPDATE SET value = EXCLUDED.value`,
        [timestamp, datapointId, value],
      );

      return result.rows.length > 0;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    } finally {
      client.release();
    }
  }
}
