import { PushEventType } from './push-event-type.enum';

export interface PushEvent {
	eventType: PushEventType;
	payload: unknown;
	timestamp: string;
}
