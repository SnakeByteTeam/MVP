import { Injectable } from '@nestjs/common';
import { ApiAuthUseCase } from '../ports/in/api-auth.usecase';

@Injectable()
export class ApiAuthVimarService implements ApiAuthUseCase {
  private readonly REDIRECT_URI =
    process.env.REDIRECT_URI || 'http://localhost:3000/tokens/callback';

  getLoginUrl(): string {
    const options: Record<string, string> = {
      response_type: 'code',
      client_id: process.env.CLIENTID || '',
      scope: 'read write manage',
      redirect_uri: this.REDIRECT_URI,
    };

    const params = new URLSearchParams(options);

    return `${process.env.HOST1}?${params.toString()}`;
  }
}
