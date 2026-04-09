import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { ApiErrorDisplayService } from '../../../core/services/api-error-display.service';
import { IVimarCloudApiService } from '../../../core/services/vimar-cloud-api.service.interface';
import { API_BASE_URL } from '../../../core/tokens/api-base-url.token';
import { MyVimarAccount } from '../models/my-vimar-account.model';

interface PrepareOAuthTicketResponse {
  ticket: string;
}

@Injectable()
export class MyVimarCloudApiFeatureService implements IVimarCloudApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly apiErrorDisplayService = inject(ApiErrorDisplayService);
  private readonly prepareAuthorizeEndpoint = `${this.baseUrl}/api/auth/prepare-oauth`;
  private readonly authorizeEndpoint = `${this.baseUrl}/api/auth/authorize`;
  private readonly accountEndpoints = [
    `${this.baseUrl}/my-vimar/account`,
    `${this.baseUrl}/api/vimar-account`,
  ];
  private readonly fallbackAccount: MyVimarAccount = { email: '', isLinked: false };

  constructor(@Inject(DOCUMENT) private readonly document: Document) { }

  public getLinkedAccount(): Observable<MyVimarAccount> {
    return this.getLinkedAccountFromEndpoint(0);
  }

  public initiateOAuth(): void {
    const location = this.document.defaultView?.location;
    const browser = this.document.defaultView;

    if (!location) {
      throw new Error('Browser location is not available for OAuth redirection.');
    }

    const redirectUrl = `${location.origin}/vimar-link`;
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);

    this.http.post<PrepareOAuthTicketResponse>(this.prepareAuthorizeEndpoint, {}).subscribe({
      next: (response) => {
        const ticket = response?.ticket?.trim();
        if (!ticket) {
          this.showOAuthError(
            'Ticket OAuth non valido. Riprova tra qualche istante.',
            browser,
          );
          return;
        }

        // Trigger a full-page navigation so backend 302 redirects are handled by the browser.
        location.href =
          `${this.authorizeEndpoint}?ticket=${encodeURIComponent(ticket)}` +
          `&redirect_url=${encodedRedirectUrl}`;
      },
      error: (error: unknown) => {
        const message = this.apiErrorDisplayService.toMessage(error, {
          fallbackMessage:
            'Impossibile avviare il collegamento MyVimar. Riprova tra qualche istante.',
          actionLabel: 'avviare il collegamento MyVimar',
          nonHttpStrategy: 'message',
        });

        this.showOAuthError(message, browser);
      },
    });
  }

  public unlinkAccount(): Observable<void> {
    return this.unlinkAccountFromEndpoint(0);
  }

  private getLinkedAccountFromEndpoint(index: number): Observable<MyVimarAccount> {
    const endpoint = this.accountEndpoints[index];
    if (!endpoint) {
      return of(this.fallbackAccount);
    }

    return this.http.get<MyVimarAccount>(endpoint).pipe(
      catchError((error: unknown) => {
        if (this.isNotFound(error)) {
          return this.getLinkedAccountFromEndpoint(index + 1);
        }
        return throwError(() => error);
      })
    );
  }

  private unlinkAccountFromEndpoint(index: number): Observable<void> {
    const endpoint = this.accountEndpoints[index];
    if (!endpoint) {
      return of(void 0);
    }

    return this.http.delete<void>(endpoint).pipe(
      catchError((error: unknown) => {
        if (this.isNotFound(error)) {
          return this.unlinkAccountFromEndpoint(index + 1);
        }
        return throwError(() => error);
      })
    );
  }

  private isNotFound(error: unknown): error is HttpErrorResponse {
    return error instanceof HttpErrorResponse && error.status === 404;
  }

  private showOAuthError(message: string, browser: Window | null): void {
    browser?.alert(message);
  }
}
