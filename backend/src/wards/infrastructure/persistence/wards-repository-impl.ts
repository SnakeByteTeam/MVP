import { Inject } from '@nestjs/common';
import { CreateWardRepository } from '../../application/repository/create-ward-repository.interface';
import { DeleteWardRepository } from '../../application/repository/delete-ward-repository.interface';
import { FindAllWardsRepository } from '../../application/repository/find-all-wards-repository.interface';
import { UpdateWardRepository } from '../../application/repository/update-ward-repository.interface';
import { WardEntity } from '../entities/ward-entity';
import { PG_POOL } from '../../../database/database.module';

export class WardsRepositoryImpl
  implements
    CreateWardRepository,
    DeleteWardRepository,
    FindAllWardsRepository,
    UpdateWardRepository
{
  constructor(@Inject(PG_POOL) private readonly conn) {}

  async createWard(name: string): Promise<WardEntity> {
    const result = await this.conn.query(
      'INSERT INTO ward (name) VALUES ($1) RETURNING *',
      [name],
    );

    if (result.rowCount === 0) {
      throw new Error('Create ward not found');
    }

    return result.rows[0];
  }
  deleteWard(id: number) {
    this.conn.query('DELETE FROM ward WHERE id = $1', [id]);
  }
  async findAllWards(): Promise<WardEntity[]> {
    const result = await this.conn.query('SELECT * FROM ward');

    return result.rows;
  }
  async updateWard(id: number, name: string): Promise<WardEntity> {
    const result = await this.conn.query(
      'UPDATE ward SET name = $1 WHERE id = $2 RETURNING *',
      [name, id],
    );

    if (result.rowCount === 0) {
      throw new Error('Update ward not found');
    }

    return result.rows[0];
  }
}
