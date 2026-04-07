import { Module } from '@nestjs/common';
import { ApiAuthVimarController } from './adapters/in/api-auth-vimar.controller';
import { ApiAuthTicketController } from './adapters/in/api-auth-ticket.controller';
import { APIAUTHUSECASE } from './application/ports/in/api-auth.usecase';
import { ApiAuthVimarService } from './application/services/api-auth-vimar.service';
import { HttpModule } from '@nestjs/axios';
import { GuardModule } from 'src/guard/guard.module';

import { GETTOKENSCALLBACKUSECASE } from './application/ports/in/get-tokens.usecase';
import { WRITETOKENSREPOPORT } from './application/ports/out/write-tokens-repo.port';
import { WRITETOKENSCACHEPORT } from './application/repository/write-tokens-cache.port';
import { READTOKENSCACHEPORT } from './application/repository/read-tokens-cache.port';
import { DELETETOKENSCACHEPORT } from './application/repository/delete-tokens-cache.port';
import { GETTOKENSWITHCODEPORT } from './application/ports/out/get-tokens-with-code.port';
import { GETTOKENSFROMAPIPORT } from './application/repository/get-tokens-from-api.port';
import { REFRESHTOKENSFROMAPIPORT } from './application/repository/refresh-tokens-from-api.port';
import { GETVALIDTOKENPORT } from './application/ports/out/get-valid-token.port';
import { READTOKENSFROMREPOPORT } from './application/ports/out/read-tokens-from-repo.port';
import { REFRESHTOKENSPORT } from './application/ports/out/refresh-tokens.port';
import { DELETETOKENSFROMREPOPORT } from './application/ports/out/delete-tokens-from-repo.port';
import { PREPAREOAUTHUSECASE } from './application/ports/in/prepare-oauth.usecase';
import { AUTHORIZEOAUTHUSECASE } from './application/ports/in/authorize-oauth.usecase';
import { OAUTHTICKETPORT } from './application/ports/out/oauth-ticket.port';
import { WRITEOAUTHTICKETCACHEPORT } from './application/repository/write-oauth-ticket-cache.port';
import { READOAUTHTICKETCACHEPORT } from './application/repository/read-oauth-ticket-cache.port';
import { DELETEOAUTHTICKETCACHEPORT } from './application/repository/delete-oauth-ticket-cache.port';
import { GET_ACCOUNT_STATUS_USECASE } from './application/ports/in/get-account-status.usecase';
import { READ_STATUS_PORT } from './application/ports/out/read-status.port';
import { READ_STATUS_REPO_PORT } from './application/repository/read-status.repository';

import { ApiAuthTokensService } from './application/services/api-auth-tokens.service';
import { OAuthTicketService } from './application/services/oauth-ticket.service';
import { TokenCacheImpl } from './infrastructure/persistence/tokens-cache.impl';
import { OAuthTicketCacheImpl } from './infrastructure/persistence/oauth-ticket-cache.impl';
import { WriteTokensRepoAdapter } from './adapters/out/write-tokens-repo.adapter';
import { GetTokenWithCodeAdapter } from './adapters/out/get-tokens-with-code.adapter';
import { GetTokensFromApiImpl } from './infrastructure/http/get-tokens-from-api.impl';
import { TokenService } from './application/services/tokens.service';
import { ReadTokensFromRepoAdapter } from './adapters/out/read-tokens-from-repo.adapter';
import { RefreshTokensAdapter } from './adapters/out/refresh-tokens.adapter';
import { DeleteTokensFromRepoAdapter } from './adapters/out/delete-tokens-from-repo.adapter';
import { OAuthTicketAdapter } from './adapters/out/oauth-ticket.adapter';
import { JwtModule } from '@nestjs/jwt';
import { ReadStatusAdapter } from './adapters/out/read-status.adapter';

@Module({
  imports: [HttpModule, GuardModule, JwtModule],
  controllers: [ApiAuthVimarController, ApiAuthTicketController],
  providers: [
    {
      provide: APIAUTHUSECASE,
      useClass: ApiAuthVimarService,
    },
    { provide: GETTOKENSCALLBACKUSECASE, useClass: ApiAuthTokensService },
    { provide: PREPAREOAUTHUSECASE, useClass: OAuthTicketService },
    { provide: AUTHORIZEOAUTHUSECASE, useClass: OAuthTicketService },
    { provide: OAUTHTICKETPORT, useClass: OAuthTicketAdapter },
    { provide: WRITETOKENSREPOPORT, useClass: WriteTokensRepoAdapter },
    { provide: WRITETOKENSCACHEPORT, useClass: TokenCacheImpl },
    { provide: READTOKENSCACHEPORT, useClass: TokenCacheImpl },
    { provide: DELETETOKENSCACHEPORT, useClass: TokenCacheImpl },
    { provide: WRITEOAUTHTICKETCACHEPORT, useClass: OAuthTicketCacheImpl },
    { provide: READOAUTHTICKETCACHEPORT, useClass: OAuthTicketCacheImpl },
    { provide: DELETEOAUTHTICKETCACHEPORT, useClass: OAuthTicketCacheImpl },
    { provide: GETTOKENSWITHCODEPORT, useClass: GetTokenWithCodeAdapter },
    { provide: GETTOKENSFROMAPIPORT, useClass: GetTokensFromApiImpl },
    { provide: REFRESHTOKENSFROMAPIPORT, useClass: GetTokensFromApiImpl },
    { provide: GETVALIDTOKENPORT, useClass: TokenService },
    { provide: READTOKENSFROMREPOPORT, useClass: ReadTokensFromRepoAdapter },
    { provide: REFRESHTOKENSPORT, useClass: RefreshTokensAdapter },
    {
      provide: DELETETOKENSFROMREPOPORT,
      useClass: DeleteTokensFromRepoAdapter,
    },
    { provide: GET_ACCOUNT_STATUS_USECASE, useClass: TokenService },
    { provide: READ_STATUS_PORT, useClass: ReadStatusAdapter },
    { provide: READ_STATUS_REPO_PORT, useClass: TokenCacheImpl },
  ],
  exports: [GETVALIDTOKENPORT],
})
export class ApiAuthVimarModule {}
