import { Inject, Injectable } from '@nestjs/common';
import { PG_POOL } from 'src/database/database.module';
import { Pool } from 'pg';

import { PlantEntity } from '../../../plant/infrastructure/persistence/entities/plant.entity';
import { WriteCacheRepoPort } from 'src/cache/application/repository/write-cache.repository';

@Injectable()
export class StructureCacheImpl implements WriteCacheRepoPort {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async write(plant: PlantEntity): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query(
        `INSERT INTO plant (id, data, cached_at, ward_id)
                VALUES ($1, $2, NOW(), $3)
                ON CONFLICT (id) DO UPDATE
                SET data      = EXCLUDED.data,
                    cached_at = NOW(),
                    ward_id   = EXCLUDED.ward_id`,
        [plant.id, JSON.stringify(plant.data), plant.ward_id],
      );
      return true;
    } catch {
      return false;
    } finally {
      client.release();
    }
  }
}
