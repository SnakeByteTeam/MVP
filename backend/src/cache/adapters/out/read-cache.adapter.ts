import { Inject, Injectable } from '@nestjs/common';
import { ReadCacheCmd } from 'src/cache/application/commands/read-cache.command';
import { ReadCachePort } from 'src/cache/application/ports/out/read-cache.port';
import {
  READ_CACHE_REPO_PORT,
  type ReadCacheRepoPort,
} from 'src/cache/application/repository/read-cache.repository';
import { PlantEntity } from 'src/cache/infrastructure/persistence/entities/plant.entity';
import { Plant } from 'src/plant/domain/models/plant.model';

@Injectable()
export class ReadCacheAdapter implements ReadCachePort {
  constructor(
    @Inject(READ_CACHE_REPO_PORT)
    private readonly readCacheRepo: ReadCacheRepoPort,
  ) {}

  async readCache(cmd: ReadCacheCmd): Promise<Plant | null> {
    if (!cmd?.plantId) throw new Error('PlantId is null');

    const plantEntity: PlantEntity | null = await this.readCacheRepo.read(
      cmd.plantId,
    );
    if (!plantEntity) return null;

    return PlantEntity.toDomain(plantEntity);
  }
}
