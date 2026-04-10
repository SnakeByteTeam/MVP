import { Pool } from 'pg';
import { NotificationRepositoryImpl } from './notification-repository-impl';

describe('NotificationRepositoryImpl', () => {
  let repository: NotificationRepositoryImpl;
  let queryMock: jest.Mock;

  beforeEach(() => {
    queryMock = jest.fn();
    const pool = {
      query: queryMock,
    } as unknown as Pool;

    repository = new NotificationRepositoryImpl(pool);
  });

  it('should return true when insert query affects one row', async () => {
    queryMock.mockResolvedValue({ rowCount: 1 });

    const result = await repository.writeNotification(
      3,
      'alarm-rule-1',
      '2026-04-07T20:00:00.000Z',
    );

    expect(result).toBe(true);
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notification'),
      [3, 'alarm-rule-1', '2026-04-07T20:00:00.000Z'],
    );
  });

  it('should return false when insert query affects no rows', async () => {
    queryMock.mockResolvedValue({ rowCount: 0 });

    const result = await repository.writeNotification(
      3,
      'alarm-rule-1',
      '2026-04-07T20:00:00.000Z',
    );

    expect(result).toBe(false);
  });

  it('should return false when rowCount is undefined', async () => {
    queryMock.mockResolvedValue({});

    const result = await repository.writeNotification(
      3,
      'alarm-rule-1',
      '2026-04-07T20:00:00.000Z',
    );

    expect(result).toBe(false);
  });
});
