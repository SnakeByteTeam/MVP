import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';
import { HttpModule } from '@nestjs/axios';

import { FetchNewCacheAdapter } from './adapters/out/fetch-cache.adapter';
import { WriteCacheAdapter } from './adapters/out/write-cache.adapter';
import { StructureCacheImpl } from './infrastructure/persistence/structure-cache-repository-impl';
import { SyncCacheService } from './application/services/sync-cache.service';

import { FETCH_NEW_CACHE_PORT } from './application/ports/out/fetch-new-cache.port';
import { WRITE_CACHE_PORT } from './application/ports/out/write-cache.port';
import { WRITE_CACHE_REPO_PORT } from './application/repository/write-cache.repository';
import { FETCH_NEW_CACHE_REPO_PORT } from './application/repository/fetch-new-cache.repository';
import { UPDATE_CACHE_USE_CASE } from './application/ports/in/get-valid-cache.usecase';
import { FetchStructureCacheImpl } from './infrastructure/http/fetch-plant-structure-impl';
import { CacheController } from './adapters/in/cache.controller';

@Module({
  imports: [TokensModule, HttpModule],
  controllers: [CacheController],
  providers: [
    { provide: FETCH_NEW_CACHE_PORT, useClass: FetchNewCacheAdapter },
    { provide: WRITE_CACHE_PORT, useClass: WriteCacheAdapter },
    { provide: FETCH_NEW_CACHE_REPO_PORT, useClass: FetchStructureCacheImpl },
    { provide: WRITE_CACHE_REPO_PORT, useClass: StructureCacheImpl },
    { provide: UPDATE_CACHE_USE_CASE, useClass: SyncCacheService },
  ],
  exports: [UPDATE_CACHE_USE_CASE],
})
export class CacheModule {}
