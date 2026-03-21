// Rappresenta una regola di allarme configurata, ovvero l'entità persistita
// nel database che l'Amministratore crea e gestisce tramite
// `AlarmConfigurationFeature`.

import { AlarmPriority } from "./alarm-priority.enum";
import { ThresholdOperator } from "./threshold-operator.enum";

// È il modello di lettura restituito dal backend nelle operazioni `GET`,
// `POST` e `PATCH` su `/api/alarms`. 
// NOTA BENE: Va distinto da `ActiveAlarm`, che rappresenta invece un **evento di allarme scattato** in tempo reale. !!!

export interface AlarmRule {
  id: string, //identificatore univoo della regola
  name: string,
  apartmentId: string,
  deviceId: string;
  priority: AlarmPriority;
  thresholdOperator: ThresholdOperator;
  threshold: number; //o string
  activationTime: string;
  deactivationTime: string;
  enabled: boolean;
}
