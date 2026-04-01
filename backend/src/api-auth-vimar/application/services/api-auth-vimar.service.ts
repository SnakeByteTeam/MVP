import { Injectable } from '@nestjs/common';
import { ApiAuthUseCase } from '../ports/in/api-auth.usecase';

@Injectable()
export class ApiAuthVimarService implements ApiAuthUseCase {
  private readonly authorizeHost = process.env.HOST1 || process.env.OAUTH_AUTHORIZE_URL || '';
  private readonly redirectUri = process.env.REDIRECT_URI || process.env.OAUTH_REDIRECT_URI || '';
  private readonly clientId = process.env.CLIENTID || process.env.CLIENT_ID || '';

  getLoginUrl(state?: string): string {
    const missingKeys: string[] = [];
    if (!this.authorizeHost) {
      missingKeys.push('HOST1');
    }
    if (!this.redirectUri) {
      missingKeys.push('REDIRECT_URI');
    }
    if (!this.clientId) {
      missingKeys.push('CLIENTID');
    }

    if (missingKeys.length > 0) {
      throw new Error(`MyVimar OAuth configuration is missing: ${missingKeys.join(', ')}`);
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
