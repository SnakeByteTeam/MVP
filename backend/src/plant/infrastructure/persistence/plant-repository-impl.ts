import { Inject, Injectable } from '@nestjs/common';
import { PG_POOL } from 'src/database/database.module';
import { Pool } from 'pg';

import { PlantEntity } from './entities/plant.entity';
import { FindPlantByIdRepoPort } from 'src/plant/application/repository/find-plant-by-id.repository';
import { WritePlantStructureRepoPort } from 'src/plant/application/repository/write-plant-structure.repository';

@Injectable()
export class PlantRepository
  implements FindPlantByIdRepoPort, WritePlantStructureRepoPort
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findById(plantId: string): Promise<PlantEntity | null> {
    const client = await this.pool.connect();

    try {
      const { rows } = await client.query<PlantEntity>(
        `SELECT plant_id, data, cached_at 
                FROM structure_cache 
                WHERE plant_id = $1`,
        [plantId],
      );
      if (rows.length === 0) return null;

      const row = rows[0];

      const entity: PlantEntity = {
        cached_at: row.cached_at,
        data: row.data,
      };
      return entity;
    } catch (err) {
      return null;
    } finally {
      client.release();
    }
  }

  async write(plant: PlantEntity): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query(
        `INSERT INTO structure_cache (plant_id, data, cached_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (plant_id) DO UPDATE
                SET data      = EXCLUDED.data,
                    cached_at = NOW()`,
        [plant.data.id, JSON.stringify(plant.data)],
      );
      return true;
    } catch (err) {
      return false;
    } finally {
      client.release();
    }
  }
}
