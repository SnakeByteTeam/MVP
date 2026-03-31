import { AlarmPriority } from './alarm-priority.enum';

//configurazione di un allarme
export class Alarm {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly plantId: string,
    public readonly deviceId: string,
    public readonly priority: AlarmPriority,
    public readonly threshold: number,
    public readonly activationTime: string, // quando attivare, formato hh:mm
    public readonly deactivationTime: string, // quando disattivare, formato hh:mm
    public readonly enabled: boolean, // abilitare/disabilitare l'allarme
    public readonly createdAt: Date, //lasciare?
    public readonly updatedAt: Date, //lasciare visto che l'allarme può essere per l'appunto aggiornato?
  ) {}
}
