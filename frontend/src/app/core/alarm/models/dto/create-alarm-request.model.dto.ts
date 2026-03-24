//inviato al backeend
// I DTO non sono mai costruiti dai componenti. La loro costruzione è
// responsabilità esclusiva di `AlarmConfigStateService`, che li produce a
// partire da `AlarmConfigFormValue` prima di delegare la chiamata HTTP.

// Trasporta i dati necessari alla creazione di una nuova regola di allarme
// (UC33). Viene costruito da `AlarmConfigStateService.mapToCreateRequest()` a
// partire dal valore del `FormGroup`, e passato a `AlarmApiService.createAlarm()`.

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

//CAPIRE:
// > **Nota su `apartmentId`:** il campo `apartmentId` di `AlarmRule` non è
// > incluso in `CreateAlarmRequest` perché il backend ricava l'appartamento
// > dal `DEVICE_ID` tramite la relazione `Device → Room → Apartment`. Il
// > frontend usa `apartmentId` solo per filtrare i sensori disponibili nel
// > form (UC33.1 → UC33.2); non viene trasmesso al backend.

