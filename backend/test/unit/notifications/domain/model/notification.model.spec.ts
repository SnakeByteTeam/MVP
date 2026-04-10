import { Notification } from 'src/notifications/domain/model/notification.model';

describe('Notification', () => {
  it('should return message passed to constructor', () => {
    const model = new Notification('allarme attivo');

    expect(model.getMessage()).toBe('allarme attivo');
  });
});
