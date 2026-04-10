import { LoginResDto } from 'src/auth/infrastructure/dtos/out/login-res-dto';

describe('LoginResDto', () => {
  it('should be defined', () => {
    expect(new LoginResDto()).toBeDefined();
  });
});
