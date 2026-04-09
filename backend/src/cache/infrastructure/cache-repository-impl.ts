import { Inject, Injectable } from '@nestjs/common';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';
import { CacheRepositoryPort } from 'src/cache/application/repository/cache.repository';
import { FetchStructureCacheImpl } from 'src/cache/infrastructure/http/fetch-plant-structure-impl';
import { StructureCacheImpl } from 'src/cache/infrastructure/persistence/structure-cache-repository-impl';

@Injectable()
export class CacheRepositoryImpl implements CacheRepositoryPort {
  constructor(
    private readonly fetchStructureCache: FetchStructureCacheImpl,
    private readonly structureCache: StructureCacheImpl,
  ) {}

  async fetch(validToken: string, plantId: string): Promise<PlantDto | null> {
    return await this.fetchStructureCache.fetch(validToken, plantId);
  }

  async getAllPlantIds(validToken: string): Promise<string[]> {
    return await this.fetchStructureCache.getAllPlantIds(validToken);
  }

  async write(plant: PlantEntity): Promise<boolean> {
    return await this.structureCache.write(plant);
  }
}
