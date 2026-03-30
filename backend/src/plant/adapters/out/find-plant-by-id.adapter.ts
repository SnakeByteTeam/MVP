import { Inject, Injectable } from '@nestjs/common';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import { FindPlantByIdCmd } from 'src/plant/application/commands/find-plant-by-id.command';
import { FindPlantByIdPort } from 'src/plant/application/ports/out/find-plant-by-id.port';
import {
  FIND_PLANT_BY_ID_REPO_PORT,
  FindPlantByIdRepoPort,
} from 'src/plant/application/repository/find-plant-by-id.repository';
import { Plant } from 'src/plant/domain/models/plant.model';

@Injectable()
export class FindPlantByIdAdapter implements FindPlantByIdPort {
  constructor(
    @Inject(FIND_PLANT_BY_ID_REPO_PORT)
    private readonly repo: FindPlantByIdRepoPort,
  ) {}

  async findById(cmd: FindPlantByIdCmd): Promise<Plant | null> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    const plant: PlantEntity | null = await this.repo.findById(plantId);

    if (!plant) return null;

    return PlantEntity.toDomain(plant);
  }
}
