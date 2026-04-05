import { AlarmEventsRepositoryImpl } from './alarm-events-repository-impl';

describe('AlarmEventsRepositoryImpl', () => {
  it('applica filtro active-only in getAllAlarmEvents', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const repository = new AlarmEventsRepositoryImpl({ query } as any);

    await repository.getAllAlarmEvents(6, 0);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('WHERE ae.resolution_time IS NULL');
    expect(sql).toContain('AND ae.alarm_rule_id IS NOT NULL');
    expect(params).toEqual([6, 0]);
  });

  it('applica filtro active-only in getAllAlarmEventsByUserId', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const repository = new AlarmEventsRepositoryImpl({ query } as any);

    await repository.getAllAlarmEventsByUserId(7, 6, 12);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('WHERE u.id = $1');
    expect(sql).toContain('AND ae.resolution_time IS NULL');
    expect(sql).toContain('AND ae.alarm_rule_id IS NOT NULL');
    expect(params).toEqual([7, 6, 12]);
  });
});
