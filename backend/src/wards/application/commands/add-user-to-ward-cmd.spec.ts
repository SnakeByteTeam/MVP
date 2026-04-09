import { AddUserToWardCmd } from './add-user-to-ward-cmd';

describe('AddUserToWardCmd', () => {
  it('should be defined', () => {
    expect(new AddUserToWardCmd(1, 1)).toBeDefined();
  });
});
