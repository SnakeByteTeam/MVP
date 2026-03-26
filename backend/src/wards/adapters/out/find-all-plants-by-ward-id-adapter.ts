import { Inject } from '@nestjs/common';
import { FindAllPlantsByWardIdCmd } from '../../application/commands/find-all-plants-by-ward-id-cmd';
import { FindAllPlantsByWardIdPort } from '../../application/ports/out/find-all-plants-by-ward-id-port.interface';
import {
  FIND_ALL_PLANTS_BY_WARD_ID_REPOSITORY,
  FindAllPlantsByWardIdRepository,
} from '../../application/repository/find-all-plants-by-ward-id-repository.interface';
import { Plant } from '../../domain/plant';
import { PlantEntity } from '../../infrastructure/entities/plant-entity';

export class FindAllPlantsByWardIdAdapter implements FindAllPlantsByWardIdPort {
  constructor(
    @Inject(FIND_ALL_PLANTS_BY_WARD_ID_REPOSITORY)
    private readonly findAllPlantsByWardIdRepository: FindAllPlantsByWardIdRepository,
  ) {}

  async findAllPlantsByWardId(req: FindAllPlantsByWardIdCmd): Promise<Plant[]> {
    const plantEntities: PlantEntity[] =
      await this.findAllPlantsByWardIdRepository.findAllPlantsByWardId(req.id);
      
    return plantEntities.map(
      (plantEntity) => new Plant(plantEntity.id, plantEntity.name),
    );
  }
}

export const FIND_ALL_PLANTS_BY_WARD_ID_PORT =
  'FIND_ALL_PLANTS_BY_WARD_ID_PORT';
