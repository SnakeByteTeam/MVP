import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ApiAuthVimarModule } from 'src/api-auth-vimar/api-auth-vimar.module';

import { FetchNewCacheAdapter } from './adapters/out/fetch-cache.adapter';
import { WriteCacheAdapter } from './adapters/out/write-cache.adapter';
import { StructureCacheImpl } from './infrastructure/persistence/structure-cache-repository-impl';
import { SyncCacheService } from './application/services/sync-cache.service';
import { FetchStructureCacheImpl } from './infrastructure/http/fetch-plant-structure-impl';
import { HttpCacheController } from './adapters/in/http/http-cache.controller';
import { GetAllPlantIdsAdapter } from './adapters/out/get-all-plantids.adapter';
import { EventCacheController } from './adapters/in/event/event-cache.controller';

import { FETCH_NEW_CACHE_PORT } from './application/ports/out/fetch-new-cache.port';
import { WRITE_CACHE_PORT } from './application/ports/out/write-cache.port';
import { WRITE_CACHE_REPO_PORT } from './application/repository/write-cache.repository';
import { FETCH_NEW_CACHE_REPO_PORT } from './application/repository/fetch-new-cache.repository';
import { UPDATE_CACHE_USE_CASE } from './application/ports/in/update-cache.usecase';
import { UPDATE_CACHE_ALL_PLANTS_USECASE } from './application/ports/in/update-cache-all-plants.usecase';
import { GET_ALL_PLANTIDS_PORT } from './application/ports/out/get-all-plantids.port';
import { GET_ALL_PLANTIDS_REPO_PORT } from './application/repository/get-all-plantids.repository';

@Module({
  imports: [ApiAuthVimarModule, HttpModule],
  controllers: [HttpCacheController, EventCacheController],
  providers: [
    { provide: FETCH_NEW_CACHE_PORT, useClass: FetchNewCacheAdapter },
    { provide: WRITE_CACHE_PORT, useClass: WriteCacheAdapter },
    { provide: FETCH_NEW_CACHE_REPO_PORT, useClass: FetchStructureCacheImpl },
    { provide: WRITE_CACHE_REPO_PORT, useClass: StructureCacheImpl },
    { provide: UPDATE_CACHE_USE_CASE, useClass: SyncCacheService },
    { provide: UPDATE_CACHE_ALL_PLANTS_USECASE, useClass: SyncCacheService },
    { provide: GET_ALL_PLANTIDS_PORT, useClass: GetAllPlantIdsAdapter },
    { provide: GET_ALL_PLANTIDS_REPO_PORT, useClass: FetchStructureCacheImpl },
  ],
  exports: [UPDATE_CACHE_USE_CASE, GET_ALL_PLANTIDS_PORT],
})
export class CacheModule {}
