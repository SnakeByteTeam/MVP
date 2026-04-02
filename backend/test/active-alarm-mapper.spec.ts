import { toActiveModel } from '../src/alarms/application/repository/active-alarm-mapper';
import { ActiveAlarmEntity } from '../src/alarms/infrastructure/entities/alarm-rule-entity';
import { ActiveAlarm } from '../src/alarms/domain/models/alarm-event.model';

describe('active-alarm-mapper - toActiveModel', () => {
  const triggeredAt = new Date('2024-01-01T10:00:00');

  it('dovrebbe tradurre correttamente una riga DB in ActiveAlarm non risolto', () => {
    const mockRow: ActiveAlarmEntity = {
      id: 'active-id-1',
      alarm_id: 'alarm-id-1',
      alarm_name: 'Temperatura soglia',
      danger_signal: 'Temperatura oltre soglia',
      triggered_at: triggeredAt,
      resolved_at: null,
    };

    const activeAlarm = toActiveModel(mockRow);

    expect(activeAlarm).toBeInstanceOf(ActiveAlarm);
    expect(activeAlarm.id).toBe('active-id-1');
    expect(activeAlarm.alarmId).toBe('alarm-id-1'); // alarm_rule_id → alarmRuleId
    expect(activeAlarm.alarmName).toBe('Temperatura soglia');
    expect(activeAlarm.dangerSignal).toBe('Temperatura oltre soglia');
    expect(activeAlarm.triggeredAt).toBe(triggeredAt);
    expect(activeAlarm.resolvedAt).toBeNull();
    expect(activeAlarm.isActive).toBe(true);
  });

  it('dovrebbe tradurre correttamente una riga DB in ActiveAlarm risolto', () => {
    const resolvedAt = new Date('2024-01-01T12:00:00');
    const mockRow: ActiveAlarmEntity = {
      id: 'active-id-2',
      alarm_id: 'alarm-id-1',
      alarm_name: 'Test',
      danger_signal: 'Test signal',
      triggered_at: triggeredAt,
      resolved_at: resolvedAt,
    };

    const activeAlarm = toActiveModel(mockRow);

    expect(activeAlarm.resolvedAt).toBe(resolvedAt);
    expect(activeAlarm.isActive).toBe(false);
  });
});
