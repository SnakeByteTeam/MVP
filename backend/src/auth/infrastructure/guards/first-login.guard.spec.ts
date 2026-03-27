import { FirstLoginGuard } from './first-login.guard';

describe('FirstLoginGuard', () => {
  it('should be defined', () => {
    expect(new FirstLoginGuard()).toBeDefined();
  });
});
