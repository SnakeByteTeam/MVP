import { Injectable } from '@nestjs/common';
import { ApiAuthUseCase } from '../ports/in/api-auth.usecase';

@Injectable()
export class ApiAuthVimarService implements ApiAuthUseCase {
  private readonly authorizeHost: string =
    process.env.HOST1 || process.env.AUTHORIZE_HOST || '';
  private readonly clientId: string =
    process.env.CLIENTID || process.env.CLIENT_ID || '';
  private readonly redirectUri: string =
    process.env.REDIRECT_URI || process.env.OAUTH_REDIRECT_URI || '';

  getLoginUrl(state?: string): string {
    if (!this.redirectUri) {
      throw new Error('There is no redirect_url setted');
    }

    if (!this.clientId) {
      throw new Error('MyVimar OAuth configuration is missing: CLIENTID');
    }

    if (!this.authorizeHost) {
      throw new Error('MyVimar OAuth configuration is missing: HOST1');
    }

    const options: Record<string, string> = {
      response_type: 'code',
      client_id: this.clientId,
      scope: 'read write manage',
      redirect_uri: this.redirectUri,
    };

    if (state) {
      options.state = state;
    }

    const params = new URLSearchParams(options);

    return `${this.authorizeHost}?${params.toString()}`;
  }
}
