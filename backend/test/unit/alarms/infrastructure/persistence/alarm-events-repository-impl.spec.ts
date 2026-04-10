jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

import { AlarmEventsRepositoryImpl } from 'src/alarms/infrastructure/persistence/alarm-events-repository-impl';

describe('AlarmEventsRepositoryImpl', () => {
  it('ordina gli eventi in getAllAlarmEvents', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const repository = new AlarmEventsRepositoryImpl({ query } as any);

    await repository.getAllAlarmEvents(6, 0);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('ORDER BY');
    expect(sql).toContain('ar.priority DESC');
    expect(params).toEqual([6, 0]);
  });

  it('applica filtro managed-only in getAllManagedAlarmEventsByUserId', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const repository = new AlarmEventsRepositoryImpl({ query } as any);

    await repository.getAllManagedAlarmEventsByUserId(7, 6, 12);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('JOIN "user" u_req ON u_req.id = $1');
    expect(sql).toContain('AND ae.resolution_time IS NOT NULL');
    expect(sql).toContain("r.name = 'Amministratore'");
    expect(params).toEqual([7, 6, 12]);
  });

  it('applica filtro unmanaged-only in getAllUnmanagedAlarmEventsByUserId', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const repository = new AlarmEventsRepositoryImpl({ query } as any);

    await repository.getAllUnmanagedAlarmEventsByUserId(7, 6, 12);

    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('JOIN "user" u_req ON u_req.id = $1');
    expect(sql).toContain('AND ae.resolution_time IS NULL');
    expect(sql).toContain("r.name = 'Amministratore'");
    expect(params).toEqual([7, 6, 12]);
  });
});
