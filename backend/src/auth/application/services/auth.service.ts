import { Inject, Injectable } from '@nestjs/common';
import { LoginUseCase } from '../ports/in/login-use-case.interface';
import { LoginCmd } from '../commands/login-cmd';
import { RefreshUseCase } from '../ports/in/refresh-use-case.interface';
import { LogoutUseCase } from '../ports/in/logout-use-case.interface';
import { RefreshCmd } from '../commands/refresh-cmd';
import { LogoutCmd } from '../commands/logout-cmd';
import { CHECK_CREDENTIALS_PORT } from '../../adapters/out/check-credentials-adapter';
import { CheckCredentialsPort } from '../ports/out/check-credentials-port.interface';

@Injectable()
export class AuthService implements LoginUseCase, RefreshUseCase, LogoutUseCase {

    constructor(
        @Inject(CHECK_CREDENTIALS_PORT) private readonly checkCredentialsPort: CheckCredentialsPort
    ){}

    login(req: LoginCmd) {
        const user = this.checkCredentialsPort.checkCredentials(req);
    }

    refresh(req: RefreshCmd) {
        throw new Error('Method not implemented.');
    }

    logout(req: LogoutCmd) {
        throw new Error('Method not implemented.');
    }
}

export const LOGIN_USE_CASE = 'LOGIN_USE_CASE';
export const REFRESH_USE_CASE = 'REFRESH_USE_CASE';
export const LOGOUT_USE_CASE = 'LOGOUT_USE_CASE';