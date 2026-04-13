import { describe, expect, it } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import {
  DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
  formatTriggeredNotificationTitle,
} from 'src/app/core/notification/utils/notification-title.util';

describe('notification-title util integration', () => {
  it('returns fallback when alarm name is not a string', () => {
    expect(formatTriggeredNotificationTitle(undefined, AlarmPriority.RED)).toBe(
      DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
    );
    expect(formatTriggeredNotificationTitle(null, AlarmPriority.RED)).toBe(
      DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
    );
    expect(formatTriggeredNotificationTitle(42, AlarmPriority.RED)).toBe(
      DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
    );
  });

  it('returns fallback when alarm name is empty after normalization', () => {
    expect(formatTriggeredNotificationTitle('   ', AlarmPriority.RED)).toBe(
      DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
    );
  });

  it('normalizes spaces in alarm name before composing title', () => {
    expect(formatTriggeredNotificationTitle('  Porta    ingresso   aperta ', AlarmPriority.ORANGE)).toBe(
      '! Porta ingresso aperta',
    );
  });

  it('maps WHITE priority to i symbol', () => {
    expect(formatTriggeredNotificationTitle('Messaggio info', AlarmPriority.WHITE)).toBe('i Messaggio info');
  });

  it('maps GREEN priority to bullet symbol', () => {
    expect(formatTriggeredNotificationTitle('Messaggio verde', AlarmPriority.GREEN)).toBe('• Messaggio verde');
  });

  it('maps ORANGE priority to exclamation symbol', () => {
    expect(formatTriggeredNotificationTitle('Messaggio warning', AlarmPriority.ORANGE)).toBe('! Messaggio warning');
  });

  it('maps RED priority to triangle symbol', () => {
    expect(formatTriggeredNotificationTitle('Messaggio critico', AlarmPriority.RED)).toBe('▲ Messaggio critico');
  });

  it('accepts numeric priorities encoded as strings', () => {
    expect(formatTriggeredNotificationTitle('String number', `${AlarmPriority.RED}`)).toBe('▲ String number');
  });

  it('accepts enum-like string priorities', () => {
    expect(formatTriggeredNotificationTitle('Enum string', 'red')).toBe('▲ Enum string');
    expect(formatTriggeredNotificationTitle('Enum string', 'GREEN')).toBe('• Enum string');
  });

  it('returns fallback for unknown numeric priority', () => {
    expect(formatTriggeredNotificationTitle('Unknown', 99)).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
  });

  it('returns fallback for unknown string priority', () => {
    expect(formatTriggeredNotificationTitle('Unknown', 'ALERT')).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
    expect(formatTriggeredNotificationTitle('Unknown', '')).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
    expect(formatTriggeredNotificationTitle('Unknown', '  ')).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
  });

  it('returns fallback for non integer numeric-like priorities', () => {
    expect(formatTriggeredNotificationTitle('Unknown', 2.5)).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
    expect(formatTriggeredNotificationTitle('Unknown', '2.5')).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
  });

  it('does not truncate when name fits max length', () => {
    const title = formatTriggeredNotificationTitle('ABCDE', AlarmPriority.RED, 7);
    expect(title).toBe('▲ ABCDE');
  });

  it('truncates and appends ellipsis when name exceeds max length', () => {
    const title = formatTriggeredNotificationTitle('ABCDEFGHIJKLMNOPQRSTUVWXYZ', AlarmPriority.RED, 10);
    expect(title).toBe('▲ ABCDEFG...');
  });

  it('handles very small maxLength values without throwing', () => {
    const title = formatTriggeredNotificationTitle('ABCDEFGHIJK', AlarmPriority.RED, 3);
    expect(title).toBe('▲ A...');
  });
});
