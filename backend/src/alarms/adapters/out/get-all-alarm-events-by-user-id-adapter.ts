import { GetAllAlarmEventsByUserIdCmd } from '../../application/commands/get-all-alarm-events-by-user-id-cmd';
import { GetAllAlarmEventsByUserIdPort } from '../../application/ports/out/get-all-alarms-events-by-user-id-port.interface';
import { AlarmEvent } from '../../domain/models/alarm-event.model';

export class GetAllAlarmEventsByUserIdAdapter implements GetAllAlarmEventsByUserIdPort {
  getAllAlarmEventsByUserId(
    req: GetAllAlarmEventsByUserIdCmd,
  ): Promise<AlarmEvent[]> {
    throw new Error('Method not implemented.');
  }
}
