import { Controller, Get, Inject, Query } from '@nestjs/common';
import { GETTOKENSCALLBACKUSECASE, type GetTokensCallbackUseCase } from 'src/tokens/application/ports/in/get-tokens.usecase';

@Controller('tokens')
export class TokensController {
    constructor(
        @Inject(GETTOKENSCALLBACKUSECASE) private readonly getTokensCallbackUseCase: GetTokensCallbackUseCase
    ) {}
    
    @Get('callback')
    async getTokens(@Query('code') code: string) {
        return this.getTokensCallbackUseCase.getTokens(code);
    }
}
