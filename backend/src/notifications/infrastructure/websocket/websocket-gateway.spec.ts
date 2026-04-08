import { CheckAlarmRuleResDto } from 'src/alarms/infrastructure/dtos/out/check-alarm-rule-res-dto';
import { NotificationsGateway } from './websocket-gateway';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;

  beforeEach(() => {
    gateway = new NotificationsGateway();
  });

  it('should emit push-event to ward room', async () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    (gateway as any).server = { to };

    const payload: CheckAlarmRuleResDto = {
      alarmRuleId: 'rule-1',
      wardId: 11,
      alarmEventId: 'event-1',
    };

    await gateway.notifyAlarmWard(11, payload);

    expect(to).toHaveBeenCalledWith('ward:11');
    expect(emit).toHaveBeenCalledWith('push-event', payload);
  });

  it('should emit alarm-resolved to ward room', async () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    (gateway as any).server = { to };

    await gateway.notifyAlarmResolution('event-2', 13);

    expect(to).toHaveBeenCalledWith('ward:13');
    expect(emit).toHaveBeenCalledWith('alarm-resolved', {
      alarmEventId: 'event-2',
      wardId: 13,
    });
  });

  it('should not throw when server is not initialized', async () => {
    const loggerErrorSpy = jest
      .spyOn((gateway as any).logger, 'error')
      .mockImplementation();
    (gateway as any).server = undefined;

    await expect(
      gateway.notifyAlarmWard(1, {} as CheckAlarmRuleResDto),
    ).resolves.toBeUndefined();
    await expect(
      gateway.notifyAlarmResolution('event-1', 1),
    ).resolves.toBeUndefined();

    expect(loggerErrorSpy).toHaveBeenCalledTimes(2);
  });

  it('should join ward room', async () => {
    const client = {
      id: 'socket-1',
      join: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
    } as any;

    await gateway.handleJoin(client, 7);

    expect(client.join).toHaveBeenCalledWith('ward:7');
    expect(client.disconnect).toHaveBeenCalledTimes(0);
  });

  it('should disconnect client when join fails', async () => {
    const client = {
      id: 'socket-1',
      join: jest.fn().mockRejectedValue(new Error('join failed')),
      disconnect: jest.fn(),
    } as any;

    await gateway.handleJoin(client, 7);

    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });

  it('should leave ward room', async () => {
    const client = {
      id: 'socket-1',
      leave: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn(),
    } as any;

    await gateway.handleLeave(client, 7);

    expect(client.leave).toHaveBeenCalledWith('ward:7');
    expect(client.disconnect).toHaveBeenCalledTimes(0);
  });

  it('should disconnect client when leave fails', async () => {
    const client = {
      id: 'socket-1',
      leave: jest.fn().mockRejectedValue(new Error('leave failed')),
      disconnect: jest.fn(),
    } as any;

    await gateway.handleLeave(client, 7);

    expect(client.disconnect).toHaveBeenCalledTimes(1);
  });
});
