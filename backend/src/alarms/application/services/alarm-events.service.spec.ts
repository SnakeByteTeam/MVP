import { AlarmEventsService } from './alarm-events.service';
import { GET_ALL_ALARM_EVENTS_PORT } from '../ports/out/get-all-alarm-events.port';
import { GET_ALL_ALARM_EVENTS_BY_USER_ID_PORT } from '../ports/out/get-all-alarms-events-by-user-id-port.interface';
import { RESOLVE_ALARM_EVENT_PORT } from '../ports/out/resolve-alarm-event-port.interface';

describe('AlarmEventsService', () => {
  it('should be defined', () => {
    expect(AlarmEventsService).toBeDefined();
  });
});
