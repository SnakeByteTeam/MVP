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

@Injectable()
export class AuthService implements LoginUseCase, RefreshUseCase, LogoutUseCase {

    constructor(
        @Inject(CHECK_CREDENTIALS_PORT) private readonly checkCredentialsPort: CheckCredentialsPort,
        @Inject(GENERATE_ACCESS_TOKEN_PORT) private readonly generateAccessTokenPort: GenerateAccessTokenPort,
        @Inject(GENERATE_REFRESH_TOKEN_PORT) private readonly generateRefreshTokenPort: GenerateRefreshTokenPort,
        @Inject(EXTRACT_FROM_ACCESS_TOKEN_PORT) private readonly extractFromAccessTokenPort: ExtractFromAccessTokenPort,
        @Inject(EXTRACT_FROM_REFRESH_TOKEN_PORT) private readonly extractFromRefreshTokenPort: ExtractFromRefreshTokenPort
    ){}

    login(req: LoginCmd): Tokens {
        const payload: Payload = this.checkCredentialsPort.checkCredentials(req);

        const accessToken = this.generateAccessTokenPort.generateAccessToken(
            new GenerateAccessTokenCmd(
                payload
            )
        );

        const refreshToken = this.generateRefreshTokenPort.generateRefreshToken(
            new GenerateRefreshTokenCmd(
                payload
            )
        );

        return new Tokens(accessToken, refreshToken);
    }

    refresh(req: RefreshCmd) {
        const payload: Payload = this.extractFromRefreshTokenPort.extractFromRefreshToken(
            new ExtractFromRefreshTokenCmd(
                req.refreshToken
            )
        );

        return this.generateAccessTokenPort.generateAccessToken(
            new GenerateAccessTokenCmd(
                payload
            )
        );
    }

    logout(req: LogoutCmd) {
        throw new Error('Method not implemented.');
    }
}

export const LOGIN_USE_CASE = 'LOGIN_USE_CASE';
export const REFRESH_USE_CASE = 'REFRESH_USE_CASE';
export const LOGOUT_USE_CASE = 'LOGOUT_USE_CASE';