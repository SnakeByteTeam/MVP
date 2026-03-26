import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { LoginReqDto } from '../../infrastructure/dtos/in/login-req.dto';
import {
  LOGIN_USE_CASE,
  LOGOUT_USE_CASE,
  REFRESH_USE_CASE,
} from '../../application/services/auth.service';
import { LoginUseCase } from '../../application/ports/in/login-use-case.interface';
import { LoginCmd } from '../../application/commands/login-cmd';
import { RefreshUseCase } from '../../application/ports/in/refresh-use-case.interface';
import { LogoutUseCase } from '../../application/ports/in/logout-use-case.interface';
import { RefreshCmd } from '../../application/commands/refresh-cmd';
// import { LogoutCmd } from '../../application/commands/logout-cmd';
import { LoginResDto } from '../../infrastructure/dtos/out/login-res-dto';
import { RefreshReqDto } from '../../infrastructure/dtos/in/refresh-req-dto';
import { Tokens } from '../../domain/tokens';
import { plainToInstance } from 'class-transformer';
import { RefreshResDto } from '../../infrastructure/dtos/out/refresh-res-dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { FirstLoginReqDto } from '../../infrastructure/dtos/in/first-login-req.dto';
import { FirstLoginResDto } from '../../infrastructure/dtos/out/first-login-res.dto';
import { FirstLoginCmd } from '../../application/commands/first-login-cmd';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(LOGIN_USE_CASE) private readonly loginUseCase: LoginUseCase,
    @Inject(REFRESH_USE_CASE) private readonly refreshUseCase: RefreshUseCase,
    // @Inject(LOGOUT_USE_CASE) private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @ApiOkResponse({ type: LoginResDto })
  @Post('/login')
  async login(
    @Body() req: LoginReqDto,
    @Res({ passthrough: true }) res: Response
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

  @Post('/first-login')
  async firstLogin(
    @Body() req: FirstLoginReqDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<FirstLoginResDto> {
    const tokens: Tokens = await this.loginUseCase.login(
      new FirstLoginCmd(req.username, req.password, req.tempPassword),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return plainToInstance(FirstLoginResDto, { accessToken: tokens.accessToken });
  }

  @ApiOkResponse({ type: RefreshResDto })
  @Post('/refresh')
  refresh(@Body() req: RefreshReqDto): RefreshResDto {
    const accessToken = this.refreshUseCase.refresh(
      new RefreshCmd(req.refreshToken),
    );
    return plainToInstance(RefreshResDto, { refreshToken: accessToken });
  }

  /*     @Post('/logout')
    logout(){
        return this.logoutUseCase.logout(
            new LogoutCmd(
                ""
            )
        );
    } */
}
