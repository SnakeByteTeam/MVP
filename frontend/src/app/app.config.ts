import { provideHttpClient } from '@angular/common/http';
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
import { environment } from '../environments/environment';

const apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: API_BASE_URL, useValue: apiBaseUrl },
    provideAppInitializer(() => {
      inject(EventSubscriptionService).initialize([]);
    }),
  ]
};
