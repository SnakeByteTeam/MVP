import { describe, expect, it } from 'vitest';
import { AlarmPriority } from 'src/app/core/alarm/models/alarm-priority.enum';
import {
  formatTriggeredNotificationTitle,
  DEFAULT_TRIGGERED_NOTIFICATION_TITLE,
  DEFAULT_RESOLVED_NOTIFICATION_TITLE,
} from 'src/app/core/notification/utils/notification-title.util';

describe('formatTriggeredNotificationTitle', () => {
  it('returns default when alarmName is missing', () => {
    expect(formatTriggeredNotificationTitle(null, AlarmPriority.RED)).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
    expect(formatTriggeredNotificationTitle(undefined, AlarmPriority.RED)).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
    expect(formatTriggeredNotificationTitle(42, AlarmPriority.RED)).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
  });

  it('returns default when alarmName is blank string', () => {
    expect(formatTriggeredNotificationTitle('   ', AlarmPriority.RED)).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
  });

  it('returns default when priority is unknown', () => {
    expect(formatTriggeredNotificationTitle('Fire alarm', 999)).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
    expect(formatTriggeredNotificationTitle('Fire alarm', 'UNKNOWN')).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
    expect(formatTriggeredNotificationTitle('Fire alarm', null)).toBe(DEFAULT_TRIGGERED_NOTIFICATION_TITLE);
  });

  it('formats RED priority with ▲ symbol', () => {
    expect(formatTriggeredNotificationTitle('Antipanico', AlarmPriority.RED)).toBe('▲ Antipanico');
  });

  it('formats ORANGE priority with ! symbol', () => {
    expect(formatTriggeredNotificationTitle('Porta aperta', AlarmPriority.ORANGE)).toBe('! Porta aperta');
  });

  it('formats GREEN priority with • symbol', () => {
    expect(formatTriggeredNotificationTitle('Check OK', AlarmPriority.GREEN)).toBe('• Check OK');
  });

  it('formats WHITE priority with i symbol', () => {
    expect(formatTriggeredNotificationTitle('Info', AlarmPriority.WHITE)).toBe('i Info');
  });

  it('accepts numeric string priority', () => {
    // AlarmPriority.RED = 3
    const redValue = String(AlarmPriority.RED);
    expect(formatTriggeredNotificationTitle('Test', redValue)).toBe('▲ Test');
  });

  it('accepts string key priority (case-insensitive)', () => {
    expect(formatTriggeredNotificationTitle('Test', 'red')).toBe('▲ Test');
    expect(formatTriggeredNotificationTitle('Test', 'RED')).toBe('▲ Test');
  });

  it('truncates very long alarm names with ellipsis', () => {
    const longName = 'A'.repeat(100);
    const result = formatTriggeredNotificationTitle(longName, AlarmPriority.RED);
    // result is shorter than the untruncated version would be
    expect(result.length).toBeLessThan(longName.length);
    expect(result.endsWith('...')).toBe(true);
  });

  it('respects custom maxLength', () => {
    const result = formatTriggeredNotificationTitle('Antipanico lungo', AlarmPriority.RED, 10);
    // shorter than the untruncated form, meaning truncation occurred
    expect(result.length).toBeLessThan('▲ Antipanico lungo'.length);
    expect(result.endsWith('...')).toBe(true);
  });

  it('normalizes multiple spaces in alarm name', () => {
    expect(formatTriggeredNotificationTitle('Fire  alarm', AlarmPriority.RED)).toBe('▲ Fire alarm');
  });

  it('DEFAULT_RESOLVED_NOTIFICATION_TITLE is defined', () => {
    expect(DEFAULT_RESOLVED_NOTIFICATION_TITLE).toBe('Allarme risolto');
  });
});
