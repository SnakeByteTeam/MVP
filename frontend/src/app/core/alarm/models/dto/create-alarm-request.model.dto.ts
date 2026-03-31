//inviato al backeend
// I DTO non sono mai costruiti dai componenti. La loro costruzione è
// responsabilità esclusiva di `AlarmConfigStateService`, che li produce a
// partire da `AlarmConfigFormValue` prima di delegare la chiamata HTTP.

// Trasporta i dati necessari alla creazione di una nuova regola di allarme
// (UC33). Viene costruito da `AlarmConfigStateService.mapToCreateRequest()` a
// partire dal valore del `FormGroup`, e passato a `AlarmApiService.createAlarmRule()`.

// Tutti i campi sono obbligatori — la loro presenza è garantita dai validatori
// `Validators.required` nel form, che implementano le restrizioni definite da
// UC48 (sensore obbligatorio), UC49 (priorità obbligatoria) e UC50 (soglia
// obbligatoria).

export interface CreateAlarmRequestDto {
    name: string; //nome della nuova regola
    apartmentId: string;
    deviceId: string; //obbligatorio da AdR, altrimenti errore
    //come numero e non stringa (mapToCreateRequest fa la conversione)
    priority: number; //obbligatorio da AdR, altrimenti errore
    thresholdOperator: string;     //Inviato come `CHAR` (`'GT'`, `'LT'`, `'EQ'`), ottenuto dalla conversione `ThresholdOperator` → stringa in `mapToCreateRequest()`
    threshold: string; //obbligatorio da AdR, altrimenti errore
    activationTime: string; //formato HH:mm
    deactivationTime: string; //formato HH:mm
}

// Nota: il campo `apartmentId` e parte del payload frontend corrente e viene
// trasmesso in `CreateAlarmRequestDto`.

