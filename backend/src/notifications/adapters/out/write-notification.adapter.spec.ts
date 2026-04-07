import { WriteNotificationAdapter } from './write-notification.adapter';
import { WriteNotificationRepoPort } from 'src/notifications/application/repository/write-notification.repository';

describe('WriteNotificationAdapter', () => {
  let adapter: WriteNotificationAdapter;
  let repo: jest.Mocked<WriteNotificationRepoPort>;

  beforeEach(() => {
    repo = {
      writeNotification: jest.fn(),
    };
    adapter = new WriteNotificationAdapter(repo);
  });

  it('should return true when repository write succeeds', async () => {
    repo.writeNotification.mockResolvedValue(true);

    const result = await adapter.writeNotification({
      ward_id: 10,
      alarm_event_id: 'alarm-22',
      timestamp: '2026-04-07T20:00:00.000Z',
    });

    expect(result).toBe(true);
    expect(repo.writeNotification).toHaveBeenCalledWith(
      10,
      'alarm-22',
      '2026-04-07T20:00:00.000Z',
    );
  });

  it('should return false when repository write fails', async () => {
    repo.writeNotification.mockResolvedValue(false);

    const result = await adapter.writeNotification({
      ward_id: 10,
      alarm_event_id: 'alarm-22',
      timestamp: '2026-04-07T20:00:00.000Z',
    });

    expect(result).toBe(false);
  });

  it('should throw when command is missing required fields', async () => {
    await expect(
      adapter.writeNotification({
        ward_id: 10,
        alarm_event_id: '',
        timestamp: '2026-04-07T20:00:00.000Z',
      }),
    ).rejects.toThrow("Can' write notification without parameteres");

    expect(repo.writeNotification).toHaveBeenCalledTimes(0);
  });
});