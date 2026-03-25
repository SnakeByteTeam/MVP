import { Inject, Injectable } from '@nestjs/common';
import { WritePlantStructurePort } from 'src/plant/application/ports/out/write-plant-structure.port';
import {
  WRITE_PLANT_STRUCTURE_REPO_PORT,
  WritePlantStructureRepoPort,
} from 'src/plant/application/repository/write-plant-structure.repository';
import { Plant } from 'src/plant/domain/models/plant.model';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';

@Injectable()
export class WritePlantStructureAdapter implements WritePlantStructurePort {
  constructor(
    @Inject(WRITE_PLANT_STRUCTURE_REPO_PORT)
    private readonly writeStructureOnRepo: WritePlantStructureRepoPort,
  ) {}
  async writeStructure(plant: Plant): Promise<boolean> {
    const plantEntity = PlantEntity.fromDomain(plant);
    return await this.writeStructureOnRepo.write(plantEntity);
  }
}
