import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';

import { CacheAdapter } from './adapters/out/cache.adapter';
import { StructureCacheImpl } from './infrastructure/persistence/structure-cache-repository-impl';
import { SyncCacheService } from './application/services/sync-cache.service';
import { FetchStructureCacheImpl } from './infrastructure/http/fetch-plant-structure-impl';
import { CacheRepositoryImpl } from './infrastructure/cache-repository-impl';
import { HttpCacheController } from './adapters/in/http/http-cache.controller';
import { EventCacheController } from './adapters/in/event/event-cache.controller';

import { FETCH_NEW_CACHE_PORT } from './application/ports/out/fetch-new-cache.port';
import { WRITE_CACHE_PORT } from './application/ports/out/write-cache.port';
import { UPDATE_CACHE_USE_CASE } from './application/ports/in/update-cache.usecase';
import { UPDATE_CACHE_ALL_PLANTS_USECASE } from './application/ports/in/update-cache-all-plants.usecase';
import { GET_ALL_PLANTIDS_PORT } from './application/ports/out/get-all-plantids.port';
import { CACHE_REPOSITORY_PORT } from './application/repository/cache.repository';

@Module({
  imports: [ApiAuthVimarModule, HttpModule],
  controllers: [HttpCacheController, EventCacheController],
  providers: [
    // Use cases
    { provide: UPDATE_CACHE_USE_CASE, useClass: SyncCacheService },
    { provide: UPDATE_CACHE_ALL_PLANTS_USECASE, useClass: SyncCacheService },
    
    // Unified port & adapter
    { provide: CACHE_REPOSITORY_PORT, useClass: CacheRepositoryImpl },
    { provide: FETCH_NEW_CACHE_PORT, useClass: CacheAdapter },
    { provide: WRITE_CACHE_PORT, useClass: CacheAdapter },
    { provide: GET_ALL_PLANTIDS_PORT, useClass: CacheAdapter },
    
    // Standalone dependencies
    FetchStructureCacheImpl,
    StructureCacheImpl,
    CacheRepositoryImpl,
  ],
  exports: [UPDATE_CACHE_USE_CASE, GET_ALL_PLANTIDS_PORT],
})
export class CacheModule {}
