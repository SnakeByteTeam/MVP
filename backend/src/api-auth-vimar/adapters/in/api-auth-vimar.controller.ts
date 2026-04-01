import { BadRequestException, Controller, Get, Inject, InternalServerErrorException, Logger, Query, Redirect } from '@nestjs/common';
import {
  APIAUTHUSECASE,
  type ApiAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/api-auth.usecase';
import { type GetTokensCallbackUseCase, GETTOKENSCALLBACKUSECASE } from 'src/api-auth-vimar/application/ports/in/get-tokens.usecase';
import { PlantAuthDto } from 'src/api-auth-vimar/infrastructure/dto/plant-auth.dto';

@Controller('my-vimar')
export class ApiAuthVimarController {
  private readonly logger = new Logger(ApiAuthVimarController.name);

  constructor(
    @Inject(APIAUTHUSECASE)
    private readonly apiAuthVimarUseCase: ApiAuthUseCase,
    @Inject(GETTOKENSCALLBACKUSECASE)
    private readonly getTokensCallbackUseCase: GetTokensCallbackUseCase,
  ) {}

  private readonly redirect_url: string;

  @Get('auth')
  @Redirect()
  login(@Query() payload: PlantAuthDto): { url: string; statusCode: number } {
    if(!payload?.redirect_url) throw new BadRequestException;

    const state = Buffer.from(payload.redirect_url).toString('base64');
    this.logger.log(`Redirecting with state: ${state}`);

    return {
      url: this.apiAuthVimarUseCase.getLoginUrl(state),
      statusCode: 302,
    };
  }

  @Get('callback')
  @Redirect()
  async saveTokens(@Query('code') code: string, @Query('state') state: string): Promise<{ url: string, statusCode: number }> {
    if (!code) {
      throw new BadRequestException('Code is required');
    }
    try {
      this.logger.log(`Callback received with code: ${code}`);
      
      let redirectUrl = this.redirect_url;
      if (state) {
        try {
          redirectUrl = Buffer.from(state, 'base64').toString('utf-8');
          this.logger.log(`Decoded redirect URL from state: ${redirectUrl}`);
        } catch (e) {
          this.logger.error(`Failed to decode state: ${e.message}`);
        }
      }

      await this.getTokensCallbackUseCase.getTokens(code);
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error) {
      this.logger.error(`Error in callback: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
