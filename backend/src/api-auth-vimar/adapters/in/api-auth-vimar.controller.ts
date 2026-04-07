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
  Req,
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
import { AdminGuard } from 'src/guard/admin/admin.guard';
import { UserGuard } from 'src/guard/user/user.guard';
import {
  MyVimarAccountStatusDto,
  MyVimarDisconnectResDto,
} from 'src/api-auth-vimar/infrastructure/dto/my-vimar-account-status.dto';
import { GET_ACCOUNT_STATUS_USECASE, type GetAccountStatusUseCase } from 'src/api-auth-vimar/application/ports/in/get-account-status.usecase';

@ApiTags('auth')
@Controller('my-vimar')
export class ApiAuthVimarController {
  private readonly logger = new Logger(ApiAuthVimarController.name);

  constructor(
    @Inject(APIAUTHUSECASE)
    private readonly apiAuthVimarUseCase: ApiAuthUseCase,
    @Inject(GETTOKENSCALLBACKUSECASE)
    private readonly getTokensCallbackUseCase: GetTokensCallbackUseCase,
    @Inject(GET_ACCOUNT_STATUS_USECASE)
    private readonly getAccountStatusUseCase: GetAccountStatusUseCase,
    @Inject(DELETETOKENSFROMREPOPORT)
    private readonly deleteTokensFromRepo: DeleteTokensFromRepoPort,
  ) {}

  @Get('account')
  @UseGuards(UserGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get shared MyVimar account status',
    description:
      'Returns whether the shared MyVimar integration is currently linked.',
  })
  @ApiOkResponse({ type: MyVimarAccountStatusDto })
  async getAccountStatus(@Req() req): Promise<MyVimarAccountStatusDto> {
    try {
      const { isLinked, email } =
        await this.getAccountStatusUseCase.getAccountStatus(req.user.id);

      console.log(`Account status for user ${req.user.id}: ${isLinked}`);

      return {
        isLinked: isLinked,
        email: email,
      };
    } catch {
      return {
        isLinked: false,
        email: '',
      };
    }
  }

  @Delete('account')
  @UseGuards(UserGuard, AdminGuard)
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
  @UseGuards(UserGuard, AdminGuard)
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

    if (!state) {
      throw new BadRequestException('State is required');
    }

    try {
      this.logger.log(`Callback received with code: ${code}`);

      const parsedState = this.parseState(state);
      this.logger.log(
        `Decoded redirect URL from JSON state: ${parsedState.redirectUrl}`,
      );
      this.logger.log(
        `OAuth callback received for user: ${Number(parsedState.userId)}`,
      );

      await this.getTokensCallbackUseCase.getTokens(
        code,
        Number(parsedState.userId)
      );

      return {
        url: parsedState.redirectUrl,
        statusCode: 302,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in callback: ${message}`, stack);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  private parseState(state: string): { redirectUrl: string; userId: string | number } {
    let decodedState: string;

    try {
      decodedState = Buffer.from(state, 'base64').toString('utf-8');
    } catch {
      throw new BadRequestException('Invalid state format');
    }

    let parsedState: unknown;

    try {
      parsedState = JSON.parse(decodedState);
    } catch {
      throw new BadRequestException('Invalid state format');
    }

    if (!parsedState || typeof parsedState !== 'object') {
      throw new BadRequestException('Invalid state payload');
    }

    const { redirectUrl, userId } = parsedState as {
      redirectUrl?: unknown;
      userId?: unknown;
    };

    if (typeof redirectUrl !== 'string' || redirectUrl.trim().length === 0) {
      throw new BadRequestException('State must contain redirectUrl as string');
    }

    if (typeof userId !== 'string' && typeof userId !== 'number') {
      throw new BadRequestException(
        'State must contain userId as string or number',
      );
    }

    return { redirectUrl, userId };
  }
}
