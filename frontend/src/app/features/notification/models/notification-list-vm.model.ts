// View Model che rappresenta lo snapshot coerente di tutto lo stato necessario
// al template di `NotificationPageComponent`. Viene prodotto da
// `NotificationService.vm$` tramite `combineLatest`.

import { NotificationEvent } from "./notification-event.model";

// **Motivazione del ViewModel:** senza di esso, `NotificationPageComponent`
// dovrebbe gestire più `async` pipe separate su Observable distinti. Questo
// introduce il rischio di frame inconsistenti (le pipe emettono in momenti
// diversi), sposta logica di composizione nel template e duplica le dipendenze
// del componente. Con il ViewModel, il componente ha un solo `Observable`,
// il template un solo binding `async`, e l'emissione è sempre atomicamente
// coerente.


export interface NotificationListVm {
    notifications: NotificationEvent[]; //UC41, UC41.1 | Lista unificata e ordinata per `sentAt` decrescente delle notifiche storiche (HTTP) e in-session (push). La deduplicazione per `notificationId` garantisce che ogni notifica compaia una sola volta anche se presente in entrambe le sorgenti |
    unreadCount: number; //contatore notifiche non lette, derivato da AlarmStateService.getUnreadNotificationsCount()`. Alimenta `NotificationBadgeComponent` tramite `MainLayoutComponent`.

}
