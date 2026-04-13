import { Inject, Injectable } from '@nestjs/common';
import { LoginUseCase } from '../ports/in/login-use-case.interface';
import { LoginCmd } from '../commands/login-cmd';
import { RefreshUseCase } from '../ports/in/refresh-use-case.interface';
import { RefreshCmd } from '../commands/refresh-cmd';
import { CHECK_CREDENTIALS_PORT, CheckCredentialsPort } from '../ports/out/check-credentials-port.interface';
import { Tokens } from '../../domain/tokens';
import { Payload } from '../../domain/payload';
import { GENERATE_ACCESS_TOKEN_PORT, GenerateAccessTokenPort } from '../ports/out/generate-access-token-port.interface';
import { GENERATE_REFRESH_TOKEN_PORT, GenerateRefreshTokenPort } from '../ports/out/generate-refresh-token-port.interface';
import { GenerateAccessTokenCmd } from '../commands/generate-access-token-cmd';
import { GenerateRefreshTokenCmd } from '../commands/generate-refresh-token-cmd';
import { EXTRACT_FROM_ACCESS_TOKEN_PORT, ExtractFromAccessTokenPort } from '../ports/out/extract-from-access-token-port.interface';
import { EXTRACT_FROM_REFRESH_TOKEN_PORT, ExtractFromRefreshTokenPort } from '../ports/out/extract-from-refresh-token-port.interface';
import { ExtractFromRefreshTokenCmd } from '../commands/extract-from-refresh-token-cmd';
import { GENERATE_CHANGE_PASSWORD_ACCESS_TOKEN_PORT, GenerateChangePasswordAccessTokenPort } from '../ports/out/generate-change-password-access-token-port.interface';
import { GENERATE_CHANGE_PASSWORD_REFRESH_TOKEN_PORT, GenerateChangePasswordRefreshTokenPort } from '../ports/out/generate-change-password-refresh-token-port.interface';
import { GenerateChangePasswordAccessTokenCmd } from '../commands/generate-change-password-access-token-cmd';
import { GenerateChangePasswordRefreshTokenCmd } from '../commands/generate-change-password-refresh-token-cmd';
import { FirstLoginUseCase } from '../ports/in/first-login-use-case.interface';
import { FirstLoginCmd } from '../commands/first-login-cmd';
import { CheckCredentialsCmd } from '../commands/check-credentials-cmd';
import { CHANGE_CREDENTIALS_PORT, ChangeCredentialsPort } from '../ports/out/change-credentials-port.interface';
import { ChangeCredentialsCmd } from '../commands/change-credentials-cmd';
import { HASH_PASSWORD_PORT } from '../../adapters/out/hash-password-adapter';
import { HashPasswordPort } from '../ports/out/hash-password-port.interface';
import { HashPasswordCmd } from '../commands/hash-password-cmd';

@Injectable()
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
    @Inject(HASH_PASSWORD_PORT)
    private readonly hashPasswordPort: HashPasswordPort,
  ) {}

  async firstLogin(req: FirstLoginCmd): Promise<Tokens> {
    const hashedTempPassword = this.hashPasswordPort.hashPassword(
      new HashPasswordCmd(req.tempPassword),
    );

    const payload: Payload = await this.checkCredentialsPort.checkCredentials(
      new CheckCredentialsCmd(req.username, hashedTempPassword),
    );

    const hashedPassword = this.hashPasswordPort.hashPassword(
      new HashPasswordCmd(req.password),
    );

    await this.changeCredentialsPort.changeCredentials(
      new ChangeCredentialsCmd(req.username, hashedPassword, false),
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
    const hashedPassword = this.hashPasswordPort.hashPassword(
      new HashPasswordCmd(req.password),
    );

    const payload: Payload = await this.checkCredentialsPort.checkCredentials(
      new CheckCredentialsCmd(req.username, hashedPassword),
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
}

export const FIRST_LOGIN_USE_CASE = 'FIRST_LOGIN_USE_CASE';
export const LOGIN_USE_CASE = 'LOGIN_USE_CASE';
export const REFRESH_USE_CASE = 'REFRESH_USE_CASE';
