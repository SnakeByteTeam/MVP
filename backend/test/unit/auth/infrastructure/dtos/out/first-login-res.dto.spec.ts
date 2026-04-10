import { FirstLoginResDto } from 'src/auth/infrastructure/dtos/out/first-login-res.dto';

describe('FirstLoginResDto', () => {
  it('should be defined', () => {
    expect(new FirstLoginResDto()).toBeDefined();
  });
});
