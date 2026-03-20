import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { EventSubscriptionService } from './core/alarm/services/event-subscription.service';

import { routes } from './app.routes';
import { API_BASE_URL } from './core/tokens/api-base-url.token';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { environment } from '../environments/environment';

const apiBaseUrl = (() => {
  let normalized: string = environment.apiBaseUrl;
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
})();

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_BASE_URL, useValue: apiBaseUrl },
    provideAppInitializer(() => {
      inject(EventSubscriptionService).initialize([]);
    }),
  ]
};
