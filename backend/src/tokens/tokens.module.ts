import { Module } from '@nestjs/common';
import { TokensController } from './adapters/in/tokens.controller';
import { HttpModule } from '@nestjs/axios/dist/http.module';

import { GETTOKENSCALLBACKUSECASE } from './application/ports/in/get-tokens.usecase';
import { WRITETOKENSREPOPORT } from './application/ports/out/write-tokens-repo.port';
import { WRITETOKENSCACHEPORT } from './application/ports/out/write-tokens-cache.port';
import { GETTOKENSWITHCODEPORT } from './application/ports/out/get-tokens-with-code.port';
import { GETTOKENSFROMAPIPORT } from './application/ports/out/get-tokens-from-api.port';
import { READTOKENSFROMREPOPORT } from './application/ports/out/read-tokens-from-repo.port';
import { GETVALIDTOKENPORT } from './application/ports/out/get-valid-token.port';
import { READTOKENSCACHEPORT } from './application/ports/out/read-tokens-cache.port';
import { REFRESHTOKENSPORT } from './application/ports/out/refresh-tokens.port';

import { ApiAuthTokensService } from './application/services/api-auth-tokens.service';
import { WriteTokensRepoAdapter } from './adapters/out/write-tokens-repo.adapter';
import { TokenCacheImpl } from './infrastructure/persistence/tokens-cache.impl';
import { GetTokenWithCodeAdapter } from './adapters/out/get-tokens-with-code.adapter';
import { GetTokensFromApiImpl } from './infrastructure/http/get-tokens-from-api.impl';
import { ReadTokensFromRepoAdapter } from './adapters/out/read-tokens-from-repo-adapter';
import { TokenService } from './application/services/tokens.service';
import { RefreshTokensAdapter } from './adapters/out/refresh-tokens.adapter';
import { REFRESHTOKENSFROMAPIPORT } from './application/ports/out/refresh-tokens-from-api.port';



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
        {
            provide: GETVALIDTOKENPORT, 
            useClass: TokenService
        },
        {
            provide: READTOKENSFROMREPOPORT, 
            useClass: ReadTokensFromRepoAdapter
        },
        {
            provide: READTOKENSCACHEPORT, 
            useClass: TokenCacheImpl
        },
        {
            provide: REFRESHTOKENSPORT, 
            useClass: RefreshTokensAdapter
        },
        {
            provide: REFRESHTOKENSFROMAPIPORT, 
            useClass: GetTokensFromApiImpl
        },
        ApiAuthTokensService, 
        WriteTokensRepoAdapter, 
        TokenCacheImpl, 
        GetTokenWithCodeAdapter,
        GetTokensFromApiImpl, 
        TokenService,
        ReadTokensFromRepoAdapter,
        RefreshTokensAdapter
        ]
})
export class TokensModule {}
