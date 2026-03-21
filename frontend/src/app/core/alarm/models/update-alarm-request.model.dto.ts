// inviato al backend
// I DTO non sono mai costruiti dai componenti. La loro costruzione è
// responsabilità esclusiva di `AlarmConfigStateService`, che li produce a
// partire da `AlarmConfigFormValue` prima di delegare la chiamata HTTP.

import { AlarmPriority } from "./alarm-priority.enum";
import { ThresholdOperator } from "./threshold-operator.enum";

// Trasporta i dati per l'aggiornamento parziale di una regola di allarme
// esistente. È un DTO a campi opzionali — implementa semantiche `PATCH`:
// vengono inviati solo i campi effettivamente modificati.

// Copre cinque casi d'uso distinti (UC34–UC37, UC38–UC39) che operano tutti
// su sottoinsiemi diversi dei campi della regola. La scelta di un singolo DTO
// parziale in luogo di cinque DTO dedicati è una decisione deliberata:
// la distinzione tra i casi d'uso appartiene alla logica di `AlarmConfigStateService`
// (quale campo popolare), non al contratto di trasporto HTTP.


export interface UpdateAlarmRequestDto {
    priority: AlarmPriority;
    thresholdOperator: ThresholdOperator;
    threshold: string;
    armingTime: string;
    dearmingTime: string;
    isArmed: boolean;
}
