import { CheckAlarm } from 'src/alarms/domain/models/check-alarm';
import { NotifyAlarmWardAdapter } from './notify-alarm-ward.adapter';
import { NotifyAlarmWardRepoPort } from 'src/notifications/application/repository/notify-alarm-ward.repository';

describe('NotifyAlarmWardAdapter', () => {
  let adapter: NotifyAlarmWardAdapter;
  let repo: jest.Mocked<NotifyAlarmWardRepoPort>;

  beforeEach(() => {
    repo = {
      notifyAlarmWard: jest.fn(),
    };
    adapter = new NotifyAlarmWardAdapter(repo);
  });

  it('should map domain alarm to dto and call repository', async () => {
    const alarm = new CheckAlarm('rule-1', 12, 'event-7');

    await adapter.notifyAlarmWard({ alarm });

    expect(repo.notifyAlarmWard).toHaveBeenCalledTimes(1);
    expect(repo.notifyAlarmWard).toHaveBeenCalledWith(12, {
      alarmRuleId: 'rule-1',
      wardId: 12,
      alarmEventId: 'event-7',
    });
  });

  it('should throw when command has no alarm', async () => {
    expect(() =>
      adapter.notifyAlarmWard({ alarm: undefined as unknown as CheckAlarm }),
    ).toThrow('Cannot notify alarm ward without informations');
    expect(repo.notifyAlarmWard).toHaveBeenCalledTimes(0);
  });
});