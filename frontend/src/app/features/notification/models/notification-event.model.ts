// Rappresenta una singola notifica di sistema.È il modello di lettura usato
// sia come elemento della risposta`GET /api/notifications`(storico HTTP) sia
// come payload degli eventi push gestiti da`AlarmStateService.onNotificationReceived()`.

// La simmetria tra le due forme di dato è intenzionale: `NotificationService`
// può unire le due sorgenti senza trasformazioni intermedie perché entrambe
// producono istanze dello stesso tipo.È definita nel layer `core/alarm` per
// essere condivisa da`AlarmStateService`, `NotificationApiService` e
// `NotificationService` senza dipendenze circolari.

// > ** Assunzione:** il campo `notificationId` assume che il backend garantisca
// 	> l'unicità globale dell'identificatore tra sessioni diverse.Se due sessioni
// 		> distinte producessero lo stesso `notificationId` per notifiche differenti,
// > la deduplicazione in `NotificationService` produrrebbe risultati errati.
// > Questa assunzione dovrebbe essere verificata con il contratto del backend.


export interface NotificationEvent {
	notificationId: string;
	title: string;
	sentAt: string;
	eventType?: 'triggered' | 'resolved';
}
