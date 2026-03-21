import { Controller, Inject, Post } from '@nestjs/common';
import { LoginReqDto } from '../../infrastructure/dtos/in/login-req.dto';
import { LOGIN_USE_CASE } from '../../application/services/auth.service';
import { LoginUseCase } from '../../application/ports/in/login-use-case.interface';
import { LoginCmd } from '../../application/commands/login-cmd';

@Controller('auth')
export class AuthController {

    constructor(
        @Inject(LOGIN_USE_CASE) private readonly loginUseCase: LoginUseCase
    ){}

    @Post('/login')
    login(req: LoginReqDto){
        return this.loginUseCase.login(
            new LoginCmd(
                req.username,
                req.password
            )
        )
    }
}
