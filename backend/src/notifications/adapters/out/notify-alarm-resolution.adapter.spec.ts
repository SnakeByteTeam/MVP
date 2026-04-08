import { NotifyAlarmResolutionAdapter } from './notify-alarm-resolution.adapter';
import { NotifyAlarmResolutionRepoPort } from 'src/notifications/application/repository/notify-alarm-resolution.repository';

describe('NotifyAlarmResolutionAdapter', () => {
  let adapter: NotifyAlarmResolutionAdapter;
  let repo: jest.Mocked<NotifyAlarmResolutionRepoPort>;

  beforeEach(() => {
    repo = {
      notifyAlarmResolution: jest.fn(),
    };
    adapter = new NotifyAlarmResolutionAdapter(repo);
  });

  it('should call repository with alarm id and ward id', async () => {
    await adapter.notifyAlarmResolution({ alarmId: 'alarm-1', wardId: 3 });

    expect(repo.notifyAlarmResolution).toHaveBeenCalledTimes(1);
    expect(repo.notifyAlarmResolution).toHaveBeenCalledWith('alarm-1', 3);
  });
});
