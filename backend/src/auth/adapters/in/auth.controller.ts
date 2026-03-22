import { Controller, Inject, Post } from '@nestjs/common';
import { LoginReqDto } from '../../infrastructure/dtos/in/login-req.dto';
import { LOGIN_USE_CASE, LOGOUT_USE_CASE, REFRESH_USE_CASE } from '../../application/services/auth.service';
import { LoginUseCase } from '../../application/ports/in/login-use-case.interface';
import { LoginCmd } from '../../application/commands/login-cmd';
import { RefreshUseCase } from '../../application/ports/in/refresh-use-case.interface';
import { LogoutUseCase } from '../../application/ports/in/logout-use-case.interface';
import { RefreshCmd } from '../../application/commands/refresh-cmd';
import { LogoutCmd } from '../../application/commands/logout-cmd';
import { LoginResDto } from '../../infrastructure/dtos/out/login-res-dto';
import { RefreshReqDto } from '../../infrastructure/dtos/in/refresh-req-dto';

@Controller('auth')
export class AuthController {

    constructor(
        @Inject(LOGIN_USE_CASE) private readonly loginUseCase: LoginUseCase,
        @Inject(REFRESH_USE_CASE) private readonly refreshUseCase: RefreshUseCase,
        @Inject(LOGOUT_USE_CASE) private readonly logoutUseCase: LogoutUseCase
    ){}

    @Post('/login')
    login(req: LoginReqDto): LoginResDto{
        return this.loginUseCase.login(
            new LoginCmd(
                req.username,
                req.password
            )
        )
    }

    @Post('/refresh')
    refresh(req: RefreshReqDto){
        return this.refreshUseCase.refresh(
            new RefreshCmd(
                req.refreshToken
            )
        );
    }

    @Post('/logout')
    logout(){
        return this.logoutUseCase.logout(
            new LogoutCmd(
                ""
            )
        );
    }
}
