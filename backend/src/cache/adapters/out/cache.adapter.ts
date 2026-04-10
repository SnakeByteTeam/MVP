import { Injectable, Inject } from '@nestjs/common';
import { FetchNewCacheCmd } from 'src/cache/application/commands/fetch-new-cache.command';
import { FetchNewCachePort } from 'src/cache/application/ports/out/fetch-new-cache.port';
import { GetAllPlantIdsPort } from 'src/cache/application/ports/out/get-all-plantids.port';
import { WriteCachePort } from 'src/cache/application/ports/out/write-cache.port';
import { Plant } from 'src/plant/domain/models/plant.model';
import { PlantDto } from 'src/plant/infrastructure/http/dtos/plant.dto';
import { PlantEntity } from 'src/plant/infrastructure/persistence/entities/plant.entity';
import {
  type GetValidTokenPort,
  GETVALIDTOKENPORT,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import {
  CACHE_REPOSITORY_PORT,
  type CacheRepositoryPort,
} from 'src/cache/application/repository/cache.repository';

@Injectable()
export class CacheAdapter
  implements FetchNewCachePort, GetAllPlantIdsPort, WriteCachePort
{
  constructor(
    @Inject(GETVALIDTOKENPORT)
    private readonly getValidTokenPort: GetValidTokenPort,
    @Inject(CACHE_REPOSITORY_PORT)
    private readonly cacheRepository: CacheRepositoryPort,
  ) {}

  async fetch(cmd: FetchNewCacheCmd): Promise<Plant> {
    if (!cmd?.plantId) throw new Error('PlantId is null');

    const validToken: string | null =
      await this.getValidTokenPort.getValidToken();
    if (!validToken) throw new Error('Valid token not found');

    const plantDto: PlantDto | null = await this.cacheRepository.fetch(
      validToken,
      cmd.plantId,
    );
    if (!plantDto) throw new Error('Plant not found');

    return PlantDto.toDomain(plantDto);
  }

  async getAllPlantIds(): Promise<string[]> {
    const token = await this.getValidTokenPort.getValidToken();
    if (!token) throw new Error('Failed to get valid token');

    return await this.cacheRepository.getAllPlantIds(token);
  }

  async writeStructure(plant: Plant): Promise<boolean> {
    const plantEntity = PlantEntity.fromDomain(plant);
    return await this.cacheRepository.write(plantEntity);
  }
}
