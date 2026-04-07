import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Redirect,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserGuard } from 'src/guard/user/user.guard';
import { AdminGuard } from 'src/guard/admin/admin.guard';
import {
  PREPAREOAUTHUSECASE,
  type PrepareOAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/prepare-oauth.usecase';
import {
  AUTHORIZEOAUTHUSECASE,
  type AuthorizeOAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/authorize-oauth.usecase';
import {
  APIAUTHUSECASE,
  type ApiAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/api-auth.usecase';
import { PrepareOAuthTicketDto } from 'src/api-auth-vimar/infrastructure/dto/prepare-oauth-ticket.dto';

interface JwtPayloadWithUserId {
  id?: number | string;
}

@ApiTags('auth')
@Controller('api/auth')
export class ApiAuthTicketController {
  constructor(
    @Inject(PREPAREOAUTHUSECASE)
    private readonly prepareOAuthUseCase: PrepareOAuthUseCase,
    @Inject(AUTHORIZEOAUTHUSECASE)
    private readonly authorizeOAuthUseCase: AuthorizeOAuthUseCase,
    @Inject(APIAUTHUSECASE)
    private readonly apiAuthUseCase: ApiAuthUseCase,
  ) {}

  @Post('prepare-oauth')
  @UseGuards(UserGuard, AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Prepare OAuth one-time ticket',
    description:
      'Creates a one-time OAuth ticket associated to the authenticated user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket created',
    type: Object,
  })
  async prepareOAuth(
    @Req() req: Request & { user?: JwtPayloadWithUserId },
  ): Promise<PrepareOAuthTicketDto> {
    const userId = this.extractUserId(req.user);
    if (!userId) {
      throw new UnauthorizedException('Invalid user identity');
    }

    const ticket = await this.prepareOAuthUseCase.prepareOAuth(userId);

    return { ticket };
  }

  @Get('authorize')
  @Redirect()
  @ApiOperation({
    summary: 'Authorize OAuth with one-time ticket',
    description:
      'Consumes one-time ticket and redirects to provider authorization URL.',
  })
  @ApiQuery({
    name: 'ticket',
    required: true,
    type: String,
    description: 'One-time OAuth ticket',
  })
  @ApiQuery({
    name: 'redirect_url',
    required: true,
    type: String,
    description: 'Final frontend redirect URL after callback',
  })
  async authorize(
    @Query('ticket') ticket: string,
    @Query('redirect_url') redirectUrl: string,
  ): Promise<{ url: string; statusCode: number }> {
    if (!redirectUrl) {
      throw new BadRequestException('redirect_url is required');
    }

    const userId = await this.authorizeOAuthUseCase.authorizeOAuth(ticket);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired ticket');
    }

    const state = Buffer.from(
      JSON.stringify({
        redirectUrl,
        userId,
      }),
    ).toString('base64');

    return {
      url: this.apiAuthUseCase.getLoginUrl(state),
      statusCode: 302,
    };
  }

  private extractUserId(payload: JwtPayloadWithUserId | undefined): number | null {
    if (!payload || payload.id === undefined || payload.id === null) {
      return null;
    }

    const userId =
      typeof payload.id === 'number' ? payload.id : Number(payload.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }

    return userId;
  }
}