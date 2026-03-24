import { AlarmPriority } from './alarm-priority.enum';

export interface ActiveAlarm {
	id: string; //identificatore univoco dell'istanza di un allarme, usato come parametro in resolveAlarm()
	alarmRuleId: string; //identificatore della regola di allarme associata che ha generato l'istanza d'allarme
	alarmName: string; //nome dell'allarme, denormalizzato dall'API a partier da ALARM.NAME (backend)
	priority: AlarmPriority; //si può prelevare dalla rule
	triggeredAt: string; //timestamp ISO di scatto, trasformato in tempo leggibile da ElapsedTimePipe nel template di AlarmItemComponent
	resolvedAt: string | null;
	//Status calcolato su logica(ad esempio open se triggered!=null && resolutionAt==null)
	//=> non metto quindi elapsedTime perchè può essere calcolato internamente dalla pipe
	user_id: string | null; //user a cui è stato assegnato, se assegnato
}
