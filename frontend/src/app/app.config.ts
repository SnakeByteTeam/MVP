import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { EventSubscriptionService } from './core/alarm/services/event-subscription.service';

import { routes } from './app.routes';

function initializeEventSubscription(eventSubscriptionService: EventSubscriptionService): () => void {
  return () => eventSubscriptionService.initialize([]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeEventSubscription,
      deps: [EventSubscriptionService],
      multi: true,
    },
  ]
};
