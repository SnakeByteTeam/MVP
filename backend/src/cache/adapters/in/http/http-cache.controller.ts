import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import {
  UPDATE_CACHE_USE_CASE,
  type UpdateCacheUseCase,
} from 'src/cache/application/ports/in/update-cache.usecase';
import { SubNotificationPayloadDto } from 'src/cache/infrastructure/http/dtos/in/subNotification.dto';

@ApiTags('cache')
@Controller('cache')
export class HttpCacheController {
  private webhookQueue: Promise<void> = Promise.resolve();

  constructor(
    @Inject(UPDATE_CACHE_USE_CASE)
    private readonly updateCacheUseCase: UpdateCacheUseCase,
  ) {}

  @Post('update')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Update plant cache',
    description: 'Processes cache updates from webhook notifications.',
  })
  @ApiOkResponse({
    description: 'Cache update accepted. Processing in background.',
    schema: {
      example: {
        success: true,
        statusCode: 202,
        message: 'Webhook accepted. Processing update for 2 plant(s)',
      },
    },
  })
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
      this.webhookQueue = this.webhookQueue
        .then(async () => {
          for (const plantId of plantIds) {
            try {
              console.log(
                `[CacheController] Starting cache update for plant ${plantId}`,
              );
              await this.updateCacheUseCase.updateCache({ plantId: plantId });
              console.log(
                `[CacheController] Cache updated successfully for plant ${plantId}`,
              );
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : String(err);

              console.error(
                `[CacheController] Error updating cache for plant ${plantId}:`,
                errorMessage,
              );
            }
          }
        })
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : String(err);

          console.error(
            '[CacheController] Error in webhook processing queue:',
            errorMessage,
          );
        });
    });

    return {
      success: true,
      statusCode: 202,
      message: `Webhook accepted. Processing update for ${plantIds.length} plant(s)`,
    };
  }
}
