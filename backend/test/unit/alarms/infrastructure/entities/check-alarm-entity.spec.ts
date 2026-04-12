import { CheckAlarmEntity } from 'src/alarms/infrastructure/entities/check-alarm-entity';

describe('CheckAlarmEntity', () => {
  it('should be defined', () => {
    const entity = new CheckAlarmEntity('ALM001', 1, 'EVT001');

    expect(entity).toBeDefined();
  });
});
