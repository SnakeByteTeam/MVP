import { Controller, Get, Inject, Redirect } from '@nestjs/common';
import {
  APIAUTHUSECASE,
  type ApiAuthUseCase,
} from 'src/api-auth-vimar/application/ports/in/api-auth.usecase';

@Controller('auth')
export class ApiAuthVimarController {
  constructor(
    @Inject(APIAUTHUSECASE)
    private readonly apiAuthVimarUseCase: ApiAuthUseCase,
  ) {}

  @Get()
  @Redirect()
  login(): { url: string; statusCode: number } {
    return {
      url: this.apiAuthVimarUseCase.getLoginUrl(),
      statusCode: 302,
    };
  }
}
