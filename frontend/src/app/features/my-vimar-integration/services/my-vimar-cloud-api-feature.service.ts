import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IVimarCloudApiService } from '../../../core/services/vimar-cloud-api.service.interface';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { MyVimarAccount } from '../models/my-vimar-account.model';
import { OAuthCallbackParams } from '../models/oauth-callback-params.model';

@Injectable()
export class MyVimarCloudApiFeatureService implements IVimarCloudApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  public getLinkedAccount(): Observable<MyVimarAccount> {
    return this.http.get<MyVimarAccount>(`${this.baseUrl}/api/vimar-account`);
  }

  public initiateOAuth(): void {
    const location = this.document.defaultView?.location;
    if (!location) {
      throw new Error('Browser location is not available for OAuth redirection.');
    }
    // inserire i veri endpoint
    location.href = `${this.baseUrl}/api/vimar-account/oauth/authorize`;
  }

  public handleOAuthCallback(params: OAuthCallbackParams): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/vimar-account/oauth/callback`, params);
  }

  public unlinkAccount(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/vimar-account`);
  }
}
