//inviato al backeend
// I DTO non sono mai costruiti dai componenti. La loro costruzione è
// responsabilità esclusiva di `AlarmConfigStateService`, che li produce a
// partire da `AlarmConfigFormValue` prima di delegare la chiamata HTTP.

import { AlarmPriority } from "./alarm-priority.enum";
import { ThresholdOperator } from "./threshold-operator.enum";

// Trasporta i dati necessari alla creazione di una nuova regola di allarme
// (UC33). Viene costruito da `AlarmConfigStateService.mapToCreateRequest()` a
// partire dal valore del `FormGroup`, e passato a `AlarmApiService.createAlarm()`.

// Tutti i campi sono obbligatori — la loro presenza è garantita dai validatori
// `Validators.required` nel form, che implementano le restrizioni definite da
// UC48 (sensore obbligatorio), UC49 (priorità obbligatoria) e UC50 (soglia
// obbligatoria).

export interface CreateAlarmRequestDto {
    name: string;
    apartmentId: string;
    deviceId: string;
    priority: AlarmPriority;
    thresholdOperator: ThresholdOperator;
    threshold: string;
    armingTime: string;
    dearmingTime: string;
}
