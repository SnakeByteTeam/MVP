import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import { PG_POOL } from 'src/database/database.module';
import { FindPlantByIdRepoPort } from 'src/plant/application/repository/find-plant-by-id.repository';
import { FindAllAvailablePlantsRepoPort } from 'src/plant/application/repository/find-all-plants.repository';

@Injectable()
export class PlantRepositoryImpl
  implements FindPlantByIdRepoPort, FindAllAvailablePlantsRepoPort
{
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findById(plantId: string): Promise<PlantEntity | null> {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query<PlantEntity>(
        `SELECT 
        id,
        cached_at,
        data,
        ward_id
       FROM plant
       WHERE id = $1`,
        [plantId],
      );

      if (rows.length === 0) return null;

      return rows[0];
    } finally {
      client.release();
    }
  }

  async findAllAvailablePlants(): Promise<PlantEntity[] | null> {
    const client = await this.pool.connect();

    try {
      const { rows } = await client.query<PlantEntity>(
        `SELECT 
            id,
            cached_at,
            data,
            ward_id
            FROM plant
            WHERE ward_id IS NULL`,
      );

      if (rows.length === 0) return null;

      return rows;
    } finally {
      client.release();
    }
  }
}
