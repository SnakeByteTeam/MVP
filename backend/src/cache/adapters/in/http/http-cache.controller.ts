import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import {
  UPDATE_CACHE_USE_CASE,
  type UpdateCacheUseCase,
} from 'src/cache/application/ports/in/update-cache.usecase';
import { SubNotificationPayloadDto } from 'src/cache/infrastructure/http/dtos/in/subNotification.dto';

@Controller('cache')
export class HttpCacheController {
  constructor(
    @Inject(UPDATE_CACHE_USE_CASE)
    private readonly updateCacheUseCase: UpdateCacheUseCase,
  ) {}

  @Post('update')
  @HttpCode(202)
  async updateCache(@Body() payload: SubNotificationPayloadDto) {
    const plantIds = payload.data
      .filter((item: any) => item.type === 'service')
      .map((item: any) => item.id);

    console.log(
      `[CacheController] Webhook received for ${plantIds.length} plant(s): ${plantIds.join(', ')}`,
    );

    /* setImmediate fa partire le funzioni dopo aver ritornato il 202, con il for + await altrimenti il server di vimar viene 
    bombardato di richieste e risponde con 504 */
    setImmediate(async () => {
      for (const plantId of plantIds) {
        try {
          console.log(`[CacheController] Starting cache update for plant ${plantId}`);
          await this.updateCacheUseCase.updateCache({ plantId: plantId });
          console.log(`[CacheController] Cache updated successfully for plant ${plantId}`);
        } catch (err) {
          console.error(
            `[CacheController] Error updating cache for plant ${plantId}:`,
            err.message,
          );
        }
      }
    });

    return {
      success: true,
      statusCode: 202,
      message: `Webhook accepted. Processing update for ${plantIds.length} plant(s)`,
    };
  }
}
