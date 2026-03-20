import { Controller, Get, Inject, Query, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GETTOKENSCALLBACKUSECASE, type GetTokensCallbackUseCase } from 'src/tokens/application/ports/in/get-tokens.usecase';

@Controller('tokens')
export class TokensController {
    constructor(
        @Inject(GETTOKENSCALLBACKUSECASE) private readonly getTokensCallbackUseCase: GetTokensCallbackUseCase
    ) {}
    
    @Get('callback')
    async getTokens(@Query('code') code: string) {
        if (!code) {
            throw new BadRequestException('Code is required');
        }
        try{
            return await this.getTokensCallbackUseCase.getTokens(code);
        }
        catch (err) {
            throw new InternalServerErrorException('Internal server error');
        }

        
    }
}
