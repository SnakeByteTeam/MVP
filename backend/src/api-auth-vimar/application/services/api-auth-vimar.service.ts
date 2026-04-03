import { Injectable } from '@nestjs/common';
import { ApiAuthUseCase } from '../ports/in/api-auth.usecase';

@Injectable()
export class ApiAuthVimarService implements ApiAuthUseCase {
  private readonly REDIRECT_URI: string = process.env.REDIRECT_URI || '';

  getLoginUrl(state?: string): string {
    if (!this.REDIRECT_URI) throw new Error('There is no redirect_url setted');

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
