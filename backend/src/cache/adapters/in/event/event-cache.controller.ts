import { Inject, Controller } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UPDATE_CACHE_ALL_PLANTS_USECASE,
  type UpdateCacheAllPlantsUseCase,
} from 'src/cache/application/ports/in/update-cache-all-plants.usecase';

@Controller()
export class EventCacheController {
  private isCacheSyncRunning = false;

  constructor(
    @Inject(UPDATE_CACHE_ALL_PLANTS_USECASE)
    private readonly cache: UpdateCacheAllPlantsUseCase,
  ) {}

  @OnEvent('fetched.tokens')
  async updateCache() {
    if (this.isCacheSyncRunning) {
      console.warn(
        'Event received: fetched.tokens. Cache update already running, skipping duplicate event.',
      );
      return;
    }

    this.isCacheSyncRunning = true;

    console.log(
      'Event received: fetched.tokens. Updating cache for all plants...',
    );

    try {
      await this.cache.updateAllCache();
    } finally {
      this.isCacheSyncRunning = false;
    }
  }
}
