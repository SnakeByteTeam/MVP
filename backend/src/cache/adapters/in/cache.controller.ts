import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import {
  UPDATE_CACHE_USE_CASE,
  type UpdateCacheUseCase,
} from 'src/cache/application/ports/in/get-valid-cache.usecase';

@Controller('cache')
export class CacheController {
  constructor(
    @Inject(UPDATE_CACHE_USE_CASE)
    private readonly updateCacheUseCase: UpdateCacheUseCase,
  ) {}

  @Post('update')
  async updateCache(@Body() body) {
    try {
      const plantIds = body.data
        .filter((item: any) => item.type === 'service')
        .map((item: any) => item.id);

      await Promise.all(
        plantIds.map((plantId: string) =>
          this.updateCacheUseCase.updateCache({ plantId }),
        ),
      );
    } catch (error) {
      console.error(`[CacheController] Error updating cache:`, error);
      return { success: false, error: error.message };
    }
  }
}
