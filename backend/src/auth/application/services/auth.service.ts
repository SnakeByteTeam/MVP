import { Injectable } from '@nestjs/common';
import { LoginUseCase } from '../ports/in/login-use-case.interface';
import { LoginCmd } from '../commands/login-cmd';

@Injectable()
export class AuthService implements LoginUseCase {
    login(req: LoginCmd) {
        throw new Error('Method not implemented.');
    }
}

export const LOGIN_USE_CASE = 'LOGIN_USE_CASE';