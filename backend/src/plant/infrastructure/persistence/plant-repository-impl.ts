import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import { PG_POOL } from 'src/database/database.module';
import { FindPlantByIdRepoPort } from 'src/plant/application/repository/find-plant-by-id.repository';

@Injectable()
export class PlantRepositoryImpl implements FindPlantByIdRepoPort {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findById(plantId: string): Promise<PlantEntity | null> {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query<PlantEntity>(
        `SELECT 
        plant_id AS id,
        cached_at,
        data,
        ward_id
       FROM structure_cache
       WHERE plant_id = $1`,
        [plantId],
      );

      if (rows.length === 0) return null;

      return rows[0]; // ← direttamente, senza .plant
    } finally {
      client.release();
    }
  }
}
