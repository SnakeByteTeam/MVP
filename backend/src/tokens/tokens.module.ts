import { Module } from '@nestjs/common';
import { TokensController } from './adapters/in/tokens.controller';
import { HttpModule } from '@nestjs/axios/dist/http.module';

import { GETTOKENSCALLBACKUSECASE } from './application/ports/in/get-tokens.usecase';
import { WRITETOKENSREPOPORT } from './application/ports/out/write-tokens-repo.port';
import { WRITETOKENSCACHEPORT } from './application/ports/out/write-tokens-cache.port';
import { GETTOKENSWITHCODEPORT } from './application/ports/out/get-tokens-with-code.port';
import { GETTOKENSFROMAPIPORT } from './application/ports/out/get-tokens-from-api.port';

import { ApiAuthTokensService } from './application/services/api-auth-tokens.service';
import { WriteTokensRepoAdapter } from './adapters/out/write-tokens-repo.adapter';
import { TokenCacheImpl } from './infrastructure/persistence/tokens-cache.impl';
import { GetTokenWithCodeAdapter } from './adapters/out/get-tokens-with-code.adapter';
import { GetTokensFromApiImpl } from './infrastructure/http/get-tokens-from-api.impl';


@Module({
    imports: [HttpModule],
    controllers: [TokensController],
    providers: [
        {
            provide: GETTOKENSCALLBACKUSECASE, 
            useClass: ApiAuthTokensService
        }, 
        {
            provide: WRITETOKENSREPOPORT, 
            useClass: WriteTokensRepoAdapter
        }, 
        {
            provide: WRITETOKENSCACHEPORT,
            useClass: TokenCacheImpl
        },
        {
            provide: GETTOKENSWITHCODEPORT,   
            useClass: GetTokenWithCodeAdapter
        },
        {
            provide: GETTOKENSFROMAPIPORT, 
            useClass: GetTokensFromApiImpl
        },
        ApiAuthTokensService, WriteTokensRepoAdapter, TokenCacheImpl, GetTokenWithCodeAdapter, GetTokensFromApiImpl]
})
export class TokensModule {}
