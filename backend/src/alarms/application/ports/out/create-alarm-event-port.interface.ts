import { CreateAlarmEventCmd } from '../../commands/create-alarm-event-cmd';

export interface CreateAlarmEventPort {
  createAlarmEvent(req: CreateAlarmEventCmd): Promise<string>;
}

export const CREATE_ALARM_EVENT_PORT = 'CREATE_ALARM_EVENT_PORT';
