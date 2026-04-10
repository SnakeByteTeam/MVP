import { LogoutResDto } from 'src/auth/infrastructure/dtos/out/logout-res-dto';

describe('LogoutResDto', () => {
  it('should be defined', () => {
    expect(new LogoutResDto()).toBeDefined();
  });
});
