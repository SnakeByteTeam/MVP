import { FirstLoginCmd } from './first-login-cmd';

describe('FirstLoginCmd', () => {
  it('should be defined', () => {
    expect(new FirstLoginCmd('', '', '')).toBeDefined();
  });
});
