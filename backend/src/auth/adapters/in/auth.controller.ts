import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { LoginReqDto } from '../../infrastructure/dtos/in/login-req.dto';
import {
  FIRST_LOGIN_USE_CASE,
  LOGIN_USE_CASE,
  REFRESH_USE_CASE,
} from '../../application/services/auth.service';
import { LoginUseCase } from '../../application/ports/in/login-use-case.interface';
import { LoginCmd } from '../../application/commands/login-cmd';
import { RefreshUseCase } from '../../application/ports/in/refresh-use-case.interface';
import { RefreshCmd } from '../../application/commands/refresh-cmd';
import { LoginResDto } from '../../infrastructure/dtos/out/login-res-dto';
import { Tokens } from '../../domain/tokens';
import { plainToInstance } from 'class-transformer';
import { RefreshResDto } from '../../infrastructure/dtos/out/refresh-res-dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { FirstLoginReqDto } from '../../infrastructure/dtos/in/first-login-req.dto';
import { FirstLoginResDto } from '../../infrastructure/dtos/out/first-login-res.dto';
import { FirstLoginCmd } from '../../application/commands/first-login-cmd';
import { FirstLoginUseCase } from '../../application/ports/in/first-login-use-case.interface';
import { FirstLoginGuard } from '../../infrastructure/guards/first-login.guard';

import { Request, Response } from 'express';
import { LogoutResDto } from '../../infrastructure/dtos/out/logout-res-dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(FIRST_LOGIN_USE_CASE)
    private readonly firstLoginUseCase: FirstLoginUseCase,
    @Inject(LOGIN_USE_CASE) private readonly loginUseCase: LoginUseCase,
    @Inject(REFRESH_USE_CASE) private readonly refreshUseCase: RefreshUseCase,
  ) {}

  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: FirstLoginResDto })
  @UseGuards(FirstLoginGuard)
  @Post('/first-login')
  async firstLogin(
    @Body() req: FirstLoginReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FirstLoginResDto> {
    const tokens: Tokens = await this.firstLoginUseCase.firstLogin(
      new FirstLoginCmd(req.username, req.password, req.tempPassword),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return plainToInstance(FirstLoginResDto, {
      accessToken: tokens.accessToken,
    });
  }

  @ApiOkResponse({ type: LoginResDto })
  @Post('/login')
  async login(
    @Body() req: LoginReqDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResDto> {
    const tokens: Tokens = await this.loginUseCase.login(
      new LoginCmd(req.username, req.password),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return plainToInstance(LoginResDto, { accessToken: tokens.accessToken });
  }

  @ApiOkResponse({ type: RefreshResDto })
  @Post('/refresh')
  async refresh(@Req() req: Request): Promise<RefreshResDto> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }

    const accessToken = await this.refreshUseCase.refresh(
      new RefreshCmd(refreshToken),
    );

    return plainToInstance(RefreshResDto, {
      accessToken: accessToken,
    });
  }

  @ApiOkResponse({ type: LogoutResDto })
  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response): LogoutResDto {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return plainToInstance(LogoutResDto, {
      success: true,
    });
  }
}
