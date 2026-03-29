import { Inject } from '@nestjs/common';
import { PG_POOL } from '../../../database/database.module';
import { AddPlantToWardRepository } from '../../application/repository/add-plant-to-ward-repository.interface';
import { FindAllPlantsByWardIdRepository } from '../../application/repository/find-all-plants-by-ward-id-repository.interface';
import { RemovePlantFromWardRepository } from '../../application/repository/remove-plant-from-ward-repository.interface';
import { PlantEntity } from '../entities/plant-entity';

export class WardsPlantsRelationshipsRepositoryImpl
  implements
  AddPlantToWardRepository,
  FindAllPlantsByWardIdRepository,
  RemovePlantFromWardRepository {
  constructor(@Inject(PG_POOL) private readonly conn) { }

  async addPlantToWard(wardId: number, plantId: string): Promise<PlantEntity> {
    const result = await this.conn.query(
      'UPDATE plant p SET ward_id = $1 WHERE p.id = $2 RETURNING *',
      [wardId, plantId],
    );

    if (result.rowCount === 0) {
      throw new Error('Add plant to ward failed');
    }

    return result.rows[0];
  }
  async findAllPlantsByWardId(wardId: number): Promise<PlantEntity[]> {
    const result = await this.conn.query(
      'SELECT p.id, p.name FROM plant p WHERE p.ward_id = $1',
      [wardId],
    );

    return result.rows;
  }
  async removePlantFromWard(plantId: string): Promise<void> {
    await this.conn.query('UPDATE plant p SET ward_id = NULL WHERE p.id = $1', [
      plantId,
    ]);
  }
}
