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
    RemovePlantFromWardRepository
{
  constructor(@Inject(PG_POOL) private readonly conn) {}

  async addPlantToWard(
    wardId: number,
    plantId: number,
  ): Promise<PlantEntity> {
    const result = await this.conn.query(
      'WITH inserted AS ( INSERT INTO ward_plant (ward_id, plant_id) VALUES ($1, $2) RETURNING plant_id) SELECT id, name FROM plant WHERE id = (SELECT plant_id FROM inserted)',
      [wardId, plantId],
    );

    if (result.rowCount === 0) {
      throw new Error('Add plant not found');
    }

    return result.rows;
  }
  async findAllPlantsByWardId(wardId: number): Promise<PlantEntity[]> {
    const result = await this.conn.query(
      'SELECT p.id, p.name FROM plant p JOIN ward_plant wp ON p.id = wp.plant_id WHERE wp.ward_id = $1',
      [wardId],
    );

    return result.rows;
  }
  removePlantToWard(wardId: number, plantId: number) {
    throw new Error('Method not implemented.');
  }
}
