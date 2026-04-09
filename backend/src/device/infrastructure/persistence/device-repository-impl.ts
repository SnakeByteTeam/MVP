import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from 'src/database/database.module';
import {
  DEVICE_REPOSITORY_PORT,
  DeviceRepositoryPort,
} from 'src/device/application/repository/device.repository';
import { DeviceEntity } from './entities/device.entity';
import { DeviceApiImpl } from '../http/device-api-impl';
import { DatapointExtractedDto } from 'src/device/infrastructure/http/dtos/in/datapoint-response.dto';

@Injectable()
export class DeviceRepositoryImpl implements DeviceRepositoryPort {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly deviceApi: DeviceApiImpl,
  ) {}

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
       VALUES ($1::TIMESTAMPTZ, $2::TEXT, $3::TEXT)
       ON CONFLICT (timestamp, datapoint_id) DO UPDATE SET value = EXCLUDED.value`,
        [timestamp, datapointId, value],
      );

      if (!result.rowCount) return false;
      return result.rowCount > 0;
    } catch (err) {
      throw new Error(`Database error: ${err.message}`);
    } finally {
      client.release();
    }
  }

  async findByDatapointId(datapointId: string): Promise<DeviceEntity | null> {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query<{ device: DeviceEntity }>(
        `SELECT jsonb_path_query(
                      data,
                      '$.rooms[*].devices[*] ? (exists(@.datapoints[*] ? (@.id == $datapointId)))',
                      jsonb_build_object('datapointId', $1::text)
                  ) AS device
                  FROM plant;`,
        [datapointId],
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

  async getDeviceValue(
    validToken: string,
    plantId: string,
    deviceId: string,
  ): Promise<DatapointExtractedDto[]> {
    return this.deviceApi.getDeviceValue(validToken, plantId, deviceId);
  }

  async writeDeviceValue(
    validToken: string,
    plantId: string,
    datapointId: string,
    value: string,
  ): Promise<boolean> {
    return this.deviceApi.writeDeviceValue(
      validToken,
      plantId,
      datapointId,
      value,
    );
  }
}
