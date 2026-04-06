import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  APIAUTHUSECASE,
  type ApiAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/api-auth.usecase';
import {
  type GetTokensCallbackUseCase,
  GETTOKENSCALLBACKUSECASE,
} from 'src/api-auth-vimar/application/ports/in/get-tokens.usecase';
import {
  GETVALIDTOKENPORT,
  type GetValidTokenPort,
} from 'src/api-auth-vimar/application/ports/out/get-valid-token.port';
import {
  DELETETOKENSFROMREPOPORT,
  type DeleteTokensFromRepoPort,
} from 'src/api-auth-vimar/application/ports/out/delete-tokens-from-repo.port';
import { PlantAuthDto } from 'src/api-auth-vimar/infrastructure/dto/plant-auth.dto';
import {
  MyVimarAccountStatusDto,
  MyVimarDisconnectResDto,
} from 'src/api-auth-vimar/infrastructure/dto/my-vimar-account-status.dto';
import { AdminGuard } from 'src/guard/admin/admin.guard';

@ApiTags('auth')
@Controller('my-vimar')
export class ApiAuthVimarController {
  private readonly logger = new Logger(ApiAuthVimarController.name);

  constructor(
    @Inject(APIAUTHUSECASE)
    private readonly apiAuthVimarUseCase: ApiAuthUseCase,
    @Inject(GETTOKENSCALLBACKUSECASE)
    private readonly getTokensCallbackUseCase: GetTokensCallbackUseCase,
    @Inject(GETVALIDTOKENPORT)
    private readonly getValidTokenPort: GetValidTokenPort,
    @Inject(DELETETOKENSFROMREPOPORT)
    private readonly deleteTokensFromRepo: DeleteTokensFromRepoPort,
  ) {}

  @Get('account')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get shared MyVimar account status',
    description:
      'Returns whether the shared MyVimar integration is currently linked.',
  })
  @ApiOkResponse({ type: MyVimarAccountStatusDto })
  async getAccountStatus(): Promise<MyVimarAccountStatusDto> {
    try {
      const validToken = await this.getValidTokenPort.getValidToken();

      return {
        isLinked: !!validToken,
        email: '',
      };
    } catch {
      return {
        isLinked: false,
        email: '',
      };
    }
  }

  @Delete('account')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Disconnect shared MyVimar account',
    description:
      'Clears shared MyVimar cached tokens. Operation is idempotent for callers.',
  })
  @ApiOkResponse({ type: MyVimarDisconnectResDto })
  async disconnectAccount(): Promise<MyVimarDisconnectResDto> {
    try {
      const deleted = await this.deleteTokensFromRepo.deleteTokens();
      if (!deleted) {
        throw new Error('Unable to clear MyVimar tokens');
      }

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error while disconnecting shared MyVimar account: ${message}`,
      );
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Get('auth')
  @Redirect()
  @ApiOperation({
    summary: 'Login with Vimar API',
    description: 'Initiates authentication flow by redirecting to Vimar login.',
  })
  @ApiQuery({
    name: 'redirect_url',
    required: true,
    type: String,
    description: 'URL to redirect after login',
    example: 'http://localhost:4200/dashboard',
  })
  login(@Query() payload: PlantAuthDto): { url: string; statusCode: number } {
    if (!payload?.redirect_url) throw new BadRequestException();

    const state = Buffer.from(payload.redirect_url).toString('base64');
    this.logger.log(`Redirecting with state: ${state}`);

    return {
      url: this.apiAuthVimarUseCase.getLoginUrl(state),
      statusCode: 302,
    };
  }

  @Get('callback')
  @Redirect()
  @ApiOperation({
    summary: 'OAuth callback',
    description: 'Handles OAuth callback from Vimar authentication.',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    type: String,
    description: 'Authorization code',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    description: 'Encoded redirect URL',
  })
  async saveTokens(
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<{ url: string; statusCode: number }> {
    if (!code) {
      throw new BadRequestException('Code is required');
    }
    try {
      this.logger.log(`Callback received with code: ${code}`);

      let redirectUrl;

      if (state) {
        try {
          redirectUrl = Buffer.from(state, 'base64').toString('utf-8');
          this.logger.log(`Decoded redirect URL from state: ${redirectUrl}`);
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Unknown error';
          this.logger.error(`Failed to decode state: ${message}`);
        }
      }

      await this.getTokensCallbackUseCase.getTokens(code);
      return {
        url: redirectUrl,
        statusCode: 302,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in callback: ${message}`, stack);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
