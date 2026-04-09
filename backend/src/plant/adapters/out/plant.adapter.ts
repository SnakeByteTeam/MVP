import { Inject, Injectable } from '@nestjs/common';
import { FindPlantByIdCmd } from 'src/plant/application/commands/find-plant-by-id.command';
import { FindAllAvailablePlantsPort } from 'src/plant/application/ports/out/find-all-available-plants.port';
import { FindAllPlantsPort } from 'src/plant/application/ports/out/find-all-plants.port';
import { FindPlantByIdPort } from 'src/plant/application/ports/out/find-plant-by-id.port';
import { Plant } from 'src/plant/domain/models/plant.model';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import {
  PLANT_REPOSITORY_PORT,
  type PlantRepositoryPort,
} from 'src/plant/application/repository/plant.repository';

@Injectable()
export class PlantAdapter
  implements
    FindPlantByIdPort,
    FindAllAvailablePlantsPort,
    FindAllPlantsPort
{
  constructor(
    @Inject(PLANT_REPOSITORY_PORT)
    private readonly plantRepository: PlantRepositoryPort,
  ) {}

  async findById(cmd: FindPlantByIdCmd): Promise<Plant | null> {
    const plantId: string = cmd?.id;
    if (!plantId) throw new Error('PlantId is null');

    const plant: PlantEntity | null = await this.plantRepository.findById(
      plantId,
    );

    if (!plant) return null;

    return PlantEntity.toDomain(plant);
  }

  async findAllAvailablePlants(): Promise<Plant[] | null> {
    const plants: PlantEntity[] | null =
      await this.plantRepository.findAllAvailablePlants();
    if (!plants) return null;

    return plants.map((entity: PlantEntity) => PlantEntity.toDomain(entity));
  }

  async findAllPlants(): Promise<Plant[] | null> {
    const plants: PlantEntity[] | null =
      await this.plantRepository.findAllPlants();
    if (!plants) return null;

    return plants.map((entity: PlantEntity) => PlantEntity.toDomain(entity));
  }
}
