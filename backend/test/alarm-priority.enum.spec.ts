import { AlarmPriority } from '../src/alarms/domain/models/alarm-priority.enum';

describe('AlarmPriority', () => {
  it('dovrebbe avere il valore WHITE', () => {
    expect(AlarmPriority.WHITE).toBe('WHITE');
  });

  it('dovrebbe avere il valore GREEN', () => {
    expect(AlarmPriority.GREEN).toBe('GREEN');
  });

  it('dovrebbe avere il valore ORANGE', () => {
    expect(AlarmPriority.ORANGE).toBe('ORANGE');
  });

  it('dovrebbe avere il valore RED', () => {
    expect(AlarmPriority.RED).toBe('RED');
  });

  it('dovrebbe avere esattamente 4 valori', () => {
    const values = Object.values(AlarmPriority);
    expect(values).toHaveLength(4);
    expect(values).toEqual(['WHITE', 'GREEN', 'ORANGE', 'RED']);
  });
});
