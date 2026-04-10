import { RemoveUserFromWardCmd } from 'src/wards/application/commands/remove-user-from-ward-cmd';

describe('RemoveUserFromWardCmd', () => {
  it('should be defined', () => {
    expect(new RemoveUserFromWardCmd(1, 1)).toBeDefined();
  });
});
