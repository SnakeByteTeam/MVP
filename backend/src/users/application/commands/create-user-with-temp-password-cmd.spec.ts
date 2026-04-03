import { CreateUserWithTempPasswordCmd } from './create-user-with-temp-password-cmd';

describe('CreateUserTempPasswordCmd', () => {
  it('should be defined', () => {
    expect(new CreateUserWithTempPasswordCmd('', '', '', '')).toBeDefined();
  });
});
