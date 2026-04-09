import 'reflect-metadata';
import {
  SubNotificationPayloadDto,
  NotificationDataDto,
  NotificationAttributesDto,
  NotificationLinkDto,
} from './subNotification.dto';

describe('SubNotificationPayloadDto', () => {
  it('should create valid notification payload', () => {
    const link: NotificationLinkDto = {
      self: 'http://example.com/notification/1',
    };

    const attributes: NotificationAttributesDto = {
      value: '25.5',
      timestamp: '2026-04-09T10:00:00Z',
      lastModified: '2026-04-09T10:00:00Z',
    };

    const notificationData: NotificationDataDto = {
      id: 'notif-1',
      type: 'datapoint',
      attributes: attributes,
      links: link,
    };

    const payload: SubNotificationPayloadDto = {
      data: [notificationData],
    };

    expect(payload.data).toHaveLength(1);
    expect(payload.data[0].id).toBe('notif-1');
    expect(payload.data[0].type).toBe('datapoint');
    expect(payload.data[0].attributes.value).toBe('25.5');
  });

  it('should handle multiple notifications', () => {
    const payload: SubNotificationPayloadDto = {
      data: [
        {
          id: 'notif-1',
          type: 'datapoint',
          attributes: {
            value: '25.5',
            timestamp: '2026-04-09T10:00:00Z',
            lastModified: '2026-04-09T10:00:00Z',
          },
          links: { self: 'http://example.com/1' },
        },
        {
          id: 'notif-2',
          type: 'datapoint',
          attributes: {
            value: '26.0',
            timestamp: '2026-04-09T10:01:00Z',
            lastModified: '2026-04-09T10:01:00Z',
          },
          links: { self: 'http://example.com/2' },
        },
      ],
    };

    expect(payload.data).toHaveLength(2);
    expect(payload.data[0].attributes.value).toBe('25.5');
    expect(payload.data[1].attributes.value).toBe('26.0');
  });

  it('should handle numeric values', () => {
    const payload: SubNotificationPayloadDto = {
      data: [
        {
          id: 'notif-1',
          type: 'datapoint',
          attributes: {
            value: 100,
            timestamp: '2026-04-09T10:00:00Z',
            lastModified: '2026-04-09T10:00:00Z',
          },
          links: { self: 'http://example.com/1' },
        },
      ],
    };

    expect(payload.data[0].attributes.value).toBe(100);
    expect(typeof payload.data[0].attributes.value).toBe('number');
  });

  it('should handle string values', () => {
    const payload: SubNotificationPayloadDto = {
      data: [
        {
          id: 'notif-1',
          type: 'datapoint',
          attributes: {
            value: 'On',
            timestamp: '2026-04-09T10:00:00Z',
            lastModified: '2026-04-09T10:00:00Z',
          },
          links: { self: 'http://example.com/1' },
        },
      ],
    };

    expect(payload.data[0].attributes.value).toBe('On');
    expect(typeof payload.data[0].attributes.value).toBe('string');
  });

  it('should handle empty notification data', () => {
    const payload: SubNotificationPayloadDto = {
      data: [],
    };

    expect(payload.data).toEqual([]);
  });

  it('should handle missing optional timestamp', () => {
    const payload: SubNotificationPayloadDto = {
      data: [
        {
          id: 'notif-1',
          type: 'datapoint',
          attributes: {
            value: '25.5',
            lastModified: '2026-04-09T10:00:00Z',
          },
          links: { self: 'http://example.com/1' },
        },
      ],
    };

    expect(payload.data[0].attributes.timestamp).toBeUndefined();
    expect(payload.data[0].attributes.lastModified).toBe(
      '2026-04-09T10:00:00Z',
    );
  });

  it('should handle missing optional value', () => {
    const payload: SubNotificationPayloadDto = {
      data: [
        {
          id: 'notif-1',
          type: 'datapoint',
          attributes: {
            lastModified: '2026-04-09T10:00:00Z',
          },
          links: { self: 'http://example.com/1' },
        },
      ],
    };

    expect(payload.data[0].attributes.value).toBeUndefined();
  });

  it('should handle different notification types', () => {
    const payload: SubNotificationPayloadDto = {
      data: [
        {
          id: 'notif-1',
          type: 'datapoint',
          attributes: { lastModified: '2026-04-09T10:00:00Z' },
          links: { self: 'http://example.com/1' },
        },
        {
          id: 'notif-2',
          type: 'device',
          attributes: { lastModified: '2026-04-09T10:00:00Z' },
          links: { self: 'http://example.com/2' },
        },
      ],
    };

    expect(payload.data[0].type).toBe('datapoint');
    expect(payload.data[1].type).toBe('device');
  });
});
