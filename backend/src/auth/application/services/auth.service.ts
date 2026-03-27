import { Inject, Injectable } from '@nestjs/common';
import { LoginUseCase } from '../ports/in/login-use-case.interface';
import { LoginCmd } from '../commands/login-cmd';
import { RefreshUseCase } from '../ports/in/refresh-use-case.interface';
import { LogoutUseCase } from '../ports/in/logout-use-case.interface';
import { RefreshCmd } from '../commands/refresh-cmd';
import { LogoutCmd } from '../commands/logout-cmd';
import { CHECK_CREDENTIALS_PORT } from '../../adapters/out/check-credentials-adapter';
import { CheckCredentialsPort } from '../ports/out/check-credentials-port.interface';
import { Tokens } from '../../domain/tokens';
import { Payload } from '../../domain/payload';
import { GENERATE_ACCESS_TOKEN_PORT } from '../../adapters/out/generate-access-token-adapter';
import { GenerateAccessTokenPort } from '../ports/out/generate-access-token-port.interface';
import { GENERATE_REFRESH_TOKEN_PORT } from '../../adapters/out/generate-refresh-token-adapter';
import { GenerateRefreshTokenPort } from '../ports/out/generate-refresh-token-port.interface';
import { GenerateAccessTokenCmd } from '../commands/generate-access-token-cmd';
import { GenerateRefreshTokenCmd } from '../commands/generate-refresh-token-cmd';
import { EXTRACT_FROM_ACCESS_TOKEN_PORT } from '../../adapters/out/extract-from-access-token-adapter';
import { ExtractFromAccessTokenPort } from '../ports/out/extract-from-access-token-port.interface';
import { EXTRACT_FROM_REFRESH_TOKEN_PORT } from '../../adapters/out/extract-from-refresh-token-adapter';
import { ExtractFromRefreshTokenPort } from '../ports/out/extract-from-refresh-token-port.interface';
import { ExtractFromRefreshTokenCmd } from '../commands/extract-from-refresh-token-cmd';
import { CHANGE_CREDENTIALS_PORT } from '../../adapters/out/change-credentials-adapter';
import { GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT } from '../../adapters/out/generate-change-password-access-token-adapter';
import { GenerateChangePasswordAccessTokenPort } from '../ports/out/generate-change-password-access-token-port.interface';
import { GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT } from '../../adapters/out/generate-change-password-refresh-token-adapter';
import { GenerateChangePasswordRefreshTokenPort } from '../ports/out/generate-change-password-refresh-token-port.interface';
import { GenerateChangePasswordAccessTokenCmd } from '../commands/generate-change-password-access-token-cmd';
import { GenerateChangePasswordRefreshTokenCmd } from '../commands/generate-change-password-refresh-token-cmd';
import { FirstLoginUseCase } from '../ports/in/first-login-use-case.interface';
import { FirstLoginCmd } from '../commands/first-login-cmd';
import { CheckCredentialsCmd } from '../commands/check-credentials-cmd';
import { ChangeCredentialsPort } from '../ports/out/change-credentials-port.interface';
import { ChangeCredentialsCmd } from '../commands/change-credentials-cmd';

@Injectable()
/* , LogoutUseCase */
export class AuthService
  implements FirstLoginUseCase, LoginUseCase, RefreshUseCase
{
  constructor(
    @Inject(CHANGE_CREDENTIALS_PORT)
    private readonly changeCredentialsPort: ChangeCredentialsPort,
    @Inject(CHECK_CREDENTIALS_PORT)
    private readonly checkCredentialsPort: CheckCredentialsPort,
    @Inject(GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT)
    private readonly generateChangePasswordAccessTokenPort: GenerateChangePasswordAccessTokenPort,
    @Inject(GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT)
    private readonly generateChangePasswordRefreshTokenPort: GenerateChangePasswordRefreshTokenPort,
    @Inject(GENERATE_ACCESS_TOKEN_PORT)
    private readonly generateAccessTokenPort: GenerateAccessTokenPort,
    @Inject(GENERATE_REFRESH_TOKEN_PORT)
    private readonly generateRefreshTokenPort: GenerateRefreshTokenPort,
    @Inject(EXTRACT_FROM_ACCESS_TOKEN_PORT)
    private readonly extractFromAccessTokenPort: ExtractFromAccessTokenPort,
    @Inject(EXTRACT_FROM_REFRESH_TOKEN_PORT)
    private readonly extractFromRefreshTokenPort: ExtractFromRefreshTokenPort,
  ) {}

  async firstLogin(req: FirstLoginCmd): Promise<Tokens> {
    const payload: Payload = await this.checkCredentialsPort.checkCredentials(
      new CheckCredentialsCmd(req.username, req.tempPassword),
    );

    await this.changeCredentialsPort.changeCredentials(
      new ChangeCredentialsCmd(req.username, req.password, false),
    );

    payload.firstAccess = false;

    const accessToken = this.generateAccessTokenPort.generateAccessToken(
      new GenerateAccessTokenCmd(payload),
    );

    const refreshToken = this.generateRefreshTokenPort.generateRefreshToken(
      new GenerateRefreshTokenCmd(payload),
    );

    return new Tokens(accessToken, refreshToken);
  }

  async login(req: LoginCmd): Promise<Tokens> {
    const payload: Payload = await this.checkCredentialsPort.checkCredentials(
      new CheckCredentialsCmd(req.username, req.password),
    );

    let accessToken: string = '';
    let refreshToken: string = '';

    if (payload.firstAccess) {
      accessToken =
        this.generateChangePasswordAccessTokenPort.generateChangePasswordAccessToken(
          new GenerateChangePasswordAccessTokenCmd(payload),
        );

      refreshToken =
        this.generateChangePasswordRefreshTokenPort.generateChangePasswordRefreshToken(
          new GenerateChangePasswordRefreshTokenCmd(payload),
        );
    } else {
      accessToken = this.generateAccessTokenPort.generateAccessToken(
        new GenerateAccessTokenCmd(payload),
      );

      refreshToken = this.generateRefreshTokenPort.generateRefreshToken(
        new GenerateRefreshTokenCmd(payload),
      );
    }

    return new Tokens(accessToken, refreshToken);
  }

  refresh(req: RefreshCmd) {
    const payload: Payload =
      this.extractFromRefreshTokenPort.extractFromRefreshToken(
        new ExtractFromRefreshTokenCmd(req.refreshToken),
      );

    return this.generateAccessTokenPort.generateAccessToken(
      new GenerateAccessTokenCmd(payload),
    );
  }

  /*     logout(req: LogoutCmd) {
        throw new Error('Method not implemented.');
    } */
}

export const FIRST_LOGIN_USE_CASE = 'FIRST_LOGIN_USE_CASE';
export const LOGIN_USE_CASE = 'LOGIN_USE_CASE';
export const REFRESH_USE_CASE = 'REFRESH_USE_CASE';
export const LOGOUT_USE_CASE = 'LOGOUT_USE_CASE';
