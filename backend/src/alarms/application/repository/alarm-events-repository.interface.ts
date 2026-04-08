import { AlarmEventEntity } from '../../infrastructure/entities/alarm-event-entity';

export interface AlarmEventsRepository {
  createAlarmEvent(alarmRuleId: string, activationTime: Date): Promise<string>;
  getAlarmEventById(id: string): Promise<AlarmEventEntity | null>;
  getAllAlarmEvents(limit: number, offset: number): Promise<AlarmEventEntity[]>;
  getAllManagedAlarmEventsByUserId(
    id: number,
    limit: number,
    offset: number,
  ): Promise<AlarmEventEntity[]>;

  getAllUnmanagedAlarmEventsByUserId(
    id: number,
    limit: number,
    offset: number,
  ): Promise<AlarmEventEntity[]>;

  resolveAlarmEvent(alarmId: string, userId: number): Promise<void>;
  getWardAlarmEvent(alarmId: string): Promise<number>;
}

export const ALARM_EVENTS_REPOSITORY = 'ALARM_EVENTS_REPOSITORY';
