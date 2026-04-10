import { NOTIFY_ALARM_RESOLUTION_REPO_PORT } from './notify-alarm-resolution.repository';
import { NOTIFY_ALARM_WARD_REPO_PORT } from './notify-alarm-ward.repository';
import { NOTIFICATIONS_REPOSITORY_PORT } from './notifications.repository';
import { WRITE_NOTIFICATION_REPO_PORT } from './write-notification.repository';

describe('notification repository symbols', () => {
  it('should export symbols for all notification ports', () => {
    expect(typeof NOTIFICATIONS_REPOSITORY_PORT).toBe('symbol');
    expect(typeof NOTIFY_ALARM_RESOLUTION_REPO_PORT).toBe('symbol');
    expect(typeof NOTIFY_ALARM_WARD_REPO_PORT).toBe('symbol');
    expect(typeof WRITE_NOTIFICATION_REPO_PORT).toBe('symbol');
  });

  it('should export distinct symbols', () => {
    expect(NOTIFICATIONS_REPOSITORY_PORT).not.toBe(
      NOTIFY_ALARM_RESOLUTION_REPO_PORT,
    );
    expect(NOTIFICATIONS_REPOSITORY_PORT).not.toBe(NOTIFY_ALARM_WARD_REPO_PORT);
    expect(NOTIFICATIONS_REPOSITORY_PORT).not.toBe(WRITE_NOTIFICATION_REPO_PORT);
    expect(NOTIFY_ALARM_RESOLUTION_REPO_PORT).not.toBe(
      NOTIFY_ALARM_WARD_REPO_PORT,
    );
    expect(NOTIFY_ALARM_RESOLUTION_REPO_PORT).not.toBe(
      WRITE_NOTIFICATION_REPO_PORT,
    );
    expect(NOTIFY_ALARM_WARD_REPO_PORT).not.toBe(WRITE_NOTIFICATION_REPO_PORT);
  });
});