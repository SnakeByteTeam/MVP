import { Module } from '@nestjs/common';
import { TokensModule } from 'src/tokens/tokens.module';
import { HttpModule } from '@nestjs/axios';

import { FetchNewCacheAdapter } from './adapters/out/fetch-cache.adapter';
import { ReadCacheAdapter } from './adapters/out/read-cache.adapter';
import { WriteCacheAdapter } from './adapters/out/write-cache.adapter';
import { StructureCacheImpl } from './infrastructure/persistence/structure-cache-repository-impl';
import { SyncCacheService } from './application/services/sync-cache.service';

import { FETCH_NEW_CACHE_PORT } from './application/ports/out/fetch-new-cache.port';
import { READ_CACHE_PORT } from './application/ports/out/read-cache.port';
import { WRITE_CACHE_PORT } from './application/ports/out/write-cache.port';
import { WRITE_CACHE_REPO_PORT } from './application/repository/write-cache.repository';
import { READ_CACHE_REPO_PORT } from './application/repository/read-cache.repository';
import { FETCH_NEW_CACHE_REPO_PORT } from './application/repository/fetch-new-cache.repository';
import { UPDATE_CACHE_USE_CASE } from './application/ports/in/get-valid-cache.usecase';
import { FetchStructureCacheImpl } from './infrastructure/http/fetch-plant-structure-impl';

@Module({
  imports: [TokensModule, HttpModule],
  providers: [
    { provide: FETCH_NEW_CACHE_PORT, useClass: FetchNewCacheAdapter },
    { provide: READ_CACHE_PORT, useClass: ReadCacheAdapter },
    { provide: WRITE_CACHE_PORT, useClass: WriteCacheAdapter },
    { provide: FETCH_NEW_CACHE_REPO_PORT, useClass: FetchStructureCacheImpl },
    { provide: WRITE_CACHE_REPO_PORT, useClass: StructureCacheImpl },
    { provide: READ_CACHE_REPO_PORT, useClass: StructureCacheImpl },
    { provide: UPDATE_CACHE_USE_CASE, useClass: SyncCacheService },
  ],
  exports: [UPDATE_CACHE_USE_CASE],
})
export class CacheModule {}
