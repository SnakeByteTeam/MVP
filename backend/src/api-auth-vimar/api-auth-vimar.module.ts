import { Module } from '@nestjs/common';
import { ApiAuthVimarController } from './adapters/in/api-auth-vimar.controller';
import { ApiAuthTicketController } from './adapters/in/api-auth-ticket.controller';
import { APIAUTHUSECASE } from './application/ports/in/api-auth.usecase';
import { ApiAuthVimarService } from './application/services/api-auth-vimar.service';
import { HttpModule } from '@nestjs/axios';
import { GuardModule } from 'src/guard/guard.module';

import { GETTOKENSCALLBACKUSECASE } from './application/ports/in/get-tokens.usecase';
import { WRITETOKENSCACHEPORT } from './application/repository/write-tokens-cache.port';
import { READTOKENSCACHEPORT } from './application/repository/read-tokens-cache.port';
import { DELETETOKENSCACHEPORT } from './application/repository/delete-tokens-cache.port';
import { GETTOKENSFROMAPIPORT } from './application/repository/get-tokens-from-api.port';
import { REFRESHTOKENSFROMAPIPORT } from './application/repository/refresh-tokens-from-api.port';
import { GETVALIDTOKENPORT } from './application/ports/out/get-valid-token.port';
import { PREPAREOAUTHUSECASE } from './application/ports/in/prepare-oauth.usecase';
import { AUTHORIZEOAUTHUSECASE } from './application/ports/in/authorize-oauth.usecase';
import { WRITEOAUTHTICKETCACHEPORT } from './application/repository/write-oauth-ticket-cache.port';
import { READOAUTHTICKETCACHEPORT } from './application/repository/read-oauth-ticket-cache.port';
import { DELETEOAUTHTICKETCACHEPORT } from './application/repository/delete-oauth-ticket-cache.port';
import { GET_ACCOUNT_STATUS_USECASE } from './application/ports/in/get-account-status.usecase';
import { READ_STATUS_REPO_PORT } from './application/repository/read-status.repository';

import { ApiAuthTokensService } from './application/services/api-auth-tokens.service';
import { OAuthTicketService } from './application/services/oauth-ticket.service';
import { TokenCacheImpl } from './infrastructure/persistence/tokens-cache.impl';
import { OAuthTicketCacheImpl } from './infrastructure/persistence/oauth-ticket-cache.impl';
import { ApiAuthVimarAdapter, API_AUTH_VIMAR_ADAPTER_PROVIDERS } from './adapters/out/api-auth-vimar.adapter';
import { GetTokensFromApiImpl } from './infrastructure/http/get-tokens-from-api.impl';
import { TokenService } from './application/services/tokens.service';
import { JwtModule } from '@nestjs/jwt';

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
    { provide: WRITETOKENSCACHEPORT, useClass: TokenCacheImpl },
    { provide: READTOKENSCACHEPORT, useClass: TokenCacheImpl },
    { provide: DELETETOKENSCACHEPORT, useClass: TokenCacheImpl },
    { provide: WRITEOAUTHTICKETCACHEPORT, useClass: OAuthTicketCacheImpl },
    { provide: READOAUTHTICKETCACHEPORT, useClass: OAuthTicketCacheImpl },
    { provide: DELETEOAUTHTICKETCACHEPORT, useClass: OAuthTicketCacheImpl },
    { provide: GETTOKENSFROMAPIPORT, useClass: GetTokensFromApiImpl },
    { provide: REFRESHTOKENSFROMAPIPORT, useClass: GetTokensFromApiImpl },
    { provide: GETVALIDTOKENPORT, useClass: TokenService },
    { provide: GET_ACCOUNT_STATUS_USECASE, useClass: TokenService },
    { provide: READ_STATUS_REPO_PORT, useClass: TokenCacheImpl },
    
    // Unified adapter with all output port bindings
    ApiAuthVimarAdapter,
    ...API_AUTH_VIMAR_ADAPTER_PROVIDERS,
  ],
  exports: [GETVALIDTOKENPORT],
})
export class ApiAuthVimarModule {}
