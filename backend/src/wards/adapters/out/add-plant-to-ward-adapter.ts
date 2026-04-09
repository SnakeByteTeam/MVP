import { Inject } from '@nestjs/common';
import { AddPlantToWardCmd } from '../../application/commands/add-plant-to-ward-cmd';
import { AddPlantToWardPort } from '../../application/ports/out/add-plant-to-ward-port.interface';
import {
  ADD_PLANT_TO_WARD_REPOSITORY,
  AddPlantToWardRepository,
} from '../../application/repository/add-plant-to-ward-repository.interface';
import { PlantEntity } from '../../infrastructure/entities/plant-entity';
import { Plant } from 'src/plant/domain/models/plant.model';

export class AddPlantToWardAdapter implements AddPlantToWardPort {
  constructor(
    @Inject(ADD_PLANT_TO_WARD_REPOSITORY)
    private readonly addPlantToWardRepository: AddPlantToWardRepository,
  ) {}

  async addPlantToWard(req: AddPlantToWardCmd): Promise<Plant> {
    const plantEntity: PlantEntity =
      await this.addPlantToWardRepository.addPlantToWard(
        req.wardId,
        req.plantId,
      );

    return new Plant(plantEntity.id, plantEntity.name);
  }
}

export const ADD_PLANT_TO_WARD_PORT = 'ADD_PLANT_TO_WARD_PORT';
