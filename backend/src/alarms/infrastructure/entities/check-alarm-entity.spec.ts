import { CheckAlarmEntity } from './check-alarm-entity';

describe('CheckAlarmEntity', () => {
  it('should be defined', () => {
    const entity = new CheckAlarmEntity('ALM001', 1, 'EVT001');

    expect(entity).toBeDefined();
  });

  it('toDomain should convert entity to domain model', () => {
    const entity = new CheckAlarmEntity('ALM001', 1, 'EVT001');

    const domain = CheckAlarmEntity.toDomain(entity);

    expect(domain).not.toBeNull();
    expect(domain?.alarm_rule_id).toBe('ALM001');
    expect(domain?.ward_id).toBe(1);
    expect(domain?.alarm_event_id).toBe('EVT001');
  });

  it('toDomain should return null if ward_id is null', () => {
    const entity = new CheckAlarmEntity('ALM001', null, 'EVT001');

    expect(CheckAlarmEntity.toDomain(entity)).toBeNull();
  });
});
